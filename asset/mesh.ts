import { IVec3Like } from 'cc';
import { CocosSync } from '../cocos-sync';
import { SyncSceneData } from '../scene';
import { Editor, fse, path, projectAssetPath } from '../utils/editor';
import { toGltfMesh } from '../utils/gltf';
import { formatPath } from '../utils/path';
import { register, SyncAsset, SyncAssetData } from './asset';


export interface SyncSubMeshData {
    vertices: number[];
    uv: number[];
    uv1: number[];
    normals: number[];
    colors: number[];
    boneWeights: number[];
    indices: number[];
}

export interface SyncMeshData extends SyncAssetData {
    meshName: string;

    min: IVec3Like;
    max: IVec3Like;

    detail: SyncMeshDataDetail;
}

export interface SyncMeshDataDetail {
    subMeshes: SyncSubMeshData[];
}

@register
export class SyncMesh extends SyncAsset {
    static clsName = 'cc.Mesh';

    static calcPath (data: SyncMeshData, sceneData: SyncSceneData) {
        data.srcPath = data.srcPath || path.join(sceneData.assetBasePath, data.path);
        data.dstPath = path.join(projectAssetPath, sceneData.exportBasePath, data.path);

        let basenameNoExt = path.basename(data.dstPath).replace(path.extname(data.dstPath), '');
        data.dstPath = path.join(path.dirname(data.dstPath), basenameNoExt, data.meshName + '.gltf');
        data.dstUrl = `db://assets/${formatPath(path.relative(projectAssetPath, data.dstPath))}/${data.meshName}.mesh`;
    }

    static async sync (data: SyncMeshData) {
        data.detail = await CocosSync.getDetailData(data) as SyncMeshDataDetail;

        let gltf = toGltfMesh(data);

        fse.ensureDirSync(path.dirname(data.dstPath));
        fse.writeJSONSync(data.dstPath, gltf);

        await Editor.Message.request('asset-db', 'refresh-asset', data.dstUrl);
    }
}
