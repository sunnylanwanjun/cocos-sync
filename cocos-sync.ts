import { director, error, find, IVec3Like, log, Mat4, Material, Mesh, MeshRenderer, Node, Quat, Vec3, warn } from "cc";
import { EDITOR } from "cc/env";
import { SyncAssetData } from "./asset/asset";

import * as SyncComponents from './component';
import * as SyncAssets from './asset';

import { SyncComponentData } from "./component/component";
import { io } from "./utils/editor";
import { GuidProvider } from "./utils/guid-provider";
import { SyncMeshRenderer, SyncMeshRendererData } from "./component/mesh-renderer";
import { SyncNodeData } from "./node";
import { SyncSceneData } from "./scene";

let _tempQuat = new Quat();

export let CocosSync = {
    async getDetailData (asset: SyncAssetData): Promise<object | null> {
        return null;
    }
}

if (EDITOR) {
    let app = (window as any).__cocos_sync_io__;
    let _socket: any;
    if (!app) {
        app = (window as any).__cocos_sync_io__ = io('8877')
        app.on('connection', (socket: any) => {
            log('CocosSync Connected!');

            socket.on('disconnect', () => {
                log('CocosSync Disconnected!');
            });

            socket.on('sync-datas', syncDataString);

            _socket = socket;
        })
    }

    CocosSync.getDetailData = async function getDetailData (asset: SyncAssetData): Promise<object | null> {
        if (!_socket) {
            return null;
        }
        return new Promise((resolve, reject) => {
            _socket.emit('get-asset-detail', asset.uuid);
            _socket.once('get-asset-detail', (uuid: string, dataStr: string) => {
                if (uuid !== asset.uuid) {
                    reject(new Error('get-asset-detail failed: uuid not match.'));
                }
                let data: any;
                try {
                    data = JSON.parse(dataStr);
                }
                catch (err) {
                    reject(err);
                    return;
                }

                resolve(data);
            })
        })
    }

    async function syncDataString (dataStr: string) {
        let data: SyncSceneData;
        try {
            data = JSON.parse(dataStr);
        }
        catch (err) {
            error(err);
            return;
        }

        collectSceneData(data);

        await syncAssets();

        syncDatas();
    }


    let _sceneData: SyncSceneData | null = null;

    let _totalNodeCount = 0;
    let _totalComponentCount = 0;
    let _nodeCount = 0;
    let _componentCount = 0;

    let _mergeList: any[] = [];
    let _nodeList: SyncNodeData[] = [];
    let _rootNodeList: SyncNodeData[] = [];
    let _currentNodeIndex = 0;
    function collectSceneData (data: SyncSceneData) {
        _mergeList.length = 0;
        _nodeList.length = 0;
        _rootNodeList.length = 0;
        _currentNodeIndex = 0;

        _totalNodeCount = data.nodeCount;
        _totalComponentCount = data.componentCount;

        _sceneData = data;

        if (data.children) {
            for (let i = 0, l = data.children.length; i < l; i++) {
                data.children[i].parentIndex = -1;
                _rootNodeList.push(data.children[i]);
                collectNodeData(data.children[i]);
            }
        }
    }

    function calcMatrix (data: SyncNodeData) {
        let parentData = _nodeList[data.parentIndex];
        if (parentData && !parentData.matrix) {
            calcMatrix(parentData);
        }

        Quat.fromEuler(_tempQuat, data.eulerAngles.x, data.eulerAngles.y, data.eulerAngles.z);
        data.matrix = Mat4.fromRTS(new Mat4, _tempQuat, data.position, data.scale);

        if (parentData) {
            data.matrix = Mat4.multiply(data.matrix, parentData.matrix, data.matrix);
        }
    }
    function collectNodeData (data: SyncNodeData) {
        let parentData = _nodeList[data.parentIndex];
        if (parentData) {
            if (parentData.needMerge) {
                data.mergeToNodeIndex = data.parentIndex;
            }
            else if (parentData.mergeToNodeIndex >= 0) {
                data.mergeToNodeIndex = parentData.mergeToNodeIndex;
            }

            if (data.mergeToNodeIndex >= 0) {
                calcMatrix(data);
            }
        }

        let index = _nodeList.length;
        _nodeList.push(data);

        if (data.children) {
            for (let i = 0, l = data.children.length; i < l; i++) {
                data.children[i].parentIndex = index;
                collectNodeData(data.children[i]);
            }
        }
    }


    async function syncAssets () {

        SyncAssets.clear();

        let time = Date.now();
        log('Begin Sync assets...');

        let total = _sceneData!.assets.length;
        for (let i = 0; i < total; i++) {
            let dataStr = _sceneData!.assets[i];
            let data: SyncAssetData | null = null;
            try {
                data = JSON.parse(dataStr);
            }
            catch (err) {
                error(err);
                continue;
            }

            if (data) {
                log(`Sync asset: ${i} - ${total} - ${data.path}`);
                await SyncAssets.sync(data, _sceneData!);
            }
        }

        log(`End Sync assets : ${(Date.now() - time) / 1000}s`);
    }


    let _syncIntervalID = -1;
    let _startTime = 0;
    function syncDatasFrame () {
        for (let i = 0; i < 1000; i++) {
            let node = _nodeList[_currentNodeIndex];
            if (node) {
                let parent: Node | null = null;
                if (node.mergeToNodeIndex >= 0) {
                    mergeNodeData(node);
                }
                else {
                    let finded = true;
                    if (node.parentIndex !== -1) {
                        let parentData = _nodeList[node.parentIndex];
                        if (!parentData) {
                            warn('Can not find parent node data with index : ' + node.parentIndex);
                            finded = false;
                        }
                        parent = parentData.node;
                    }
                    if (finded) {
                        syncNodeData(node, parent);
                    }
                }
            }
            else {
                warn('Can not find node data with index : ' + _currentNodeIndex);
            }

            if (++_currentNodeIndex >= _nodeList.length) {
                finishMerge();

                log(`End sync : ${Date.now() - _startTime} ms`);

                clearInterval(_syncIntervalID);
                _syncIntervalID = -1;
                return;
            }
        }

        log(`Sync : Progress - ${_currentNodeIndex / _nodeList.length}, NodeCount - ${_currentNodeIndex}`);
        setTimeout(syncDatasFrame, 100);
    }
    function syncDatas () {
        if (_syncIntervalID !== -1) {
            clearInterval(_syncIntervalID);
        }

        log('Begin sync...');
        log('Total Node Count : ', _totalNodeCount);
        log('Total Component Count : ', _totalComponentCount);
        _startTime = Date.now();

        syncDatasFrame();
    }

    function finishMerge () {
        for (let i = 0; i < _mergeList.length; i++) {
            _mergeList[i].rebuild();
        }
    }

    function mergeNodeData (data: SyncNodeData) {
        _nodeCount++;

        if (!data.components) {
            return;
        }

        let root = _nodeList[data.mergeToNodeIndex];
        let rootNode = root && root.node;
        if (!root || !rootNode) {
            error('Can not find node by mergeToNodeIndex : ', data.mergeToNodeIndex);
            return;
        }

        for (let i = 0, l = data.components.length; i < l; i++) {
            _componentCount++;

            let cdata: SyncComponentData | null = null;
            try {
                cdata = JSON.parse(data.components[i]);
            }
            catch (err) {
                error(err);
                continue;
            }

            if (cdata!.name !== SyncMeshRenderer.clsName) {
                continue;
            }

            let mrData = (cdata as SyncMeshRendererData);
            let materials = mrData.materilas.map(uuid => {
                return SyncAssets.get(uuid) as Material;
            })
            let m = SyncAssets.get(mrData.mesh) as Mesh;

            let instanceObject: any = rootNode.getComponent('InstanceObject');
            if (instanceObject) {
                instanceObject.addData({ mesh: m, sharedMaterials: materials, shadowCastingMode: MeshRenderer.ShadowCastingMode.OFF }, data.matrix);
            }

            break;
        }
    }

    function syncNodeData (data: SyncNodeData, parent: Node | null = null) {
        parent = parent || director.getScene() as any;
        let guid = data.uuid;

        let provider = GuidProvider.guids.get(guid);

        let node: Node;
        if (!provider || !provider.enabledInHierarchy) {
            node = new Node(data.name);
            provider = node.addComponent(GuidProvider);
            provider.guid = guid;
        }
        else {
            node = provider.node;
        }

        node.parent = parent;
        node.setPosition(data.position as Vec3);
        node.setScale(data.scale as Vec3);
        node.eulerAngles = data.eulerAngles as Vec3;

        data.node = node;

        _nodeCount++;

        if (data.components) {
            for (let i = 0, l = data.components.length; i < l; i++) {
                let cdata: SyncComponentData | null = null;
                try {
                    cdata = JSON.parse(data.components[i]);
                }
                catch (err) {
                    error(err);
                    continue;
                }

                SyncComponents.sync(cdata!, node);
                _componentCount++;
            }
        }


        if (data.needMerge) {
            let comp = node.getComponent('InstanceObject');
            if (comp) {
                _mergeList.push(comp);
            }
        }

        return node;
    }
}
