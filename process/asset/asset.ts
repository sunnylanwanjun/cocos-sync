import { Asset } from 'cc';
import { EDITOR } from 'cc/env';
import { SyncAssetData } from '../../datas/asset/asset';
import { SyncSceneData } from '../../scene';
import { AssetOpration } from '../../utils/asset-operation';
import { cce, Editor, error, fse, log, path, projectAssetPath, projectPath } from '../../utils/editor';
import { SyncBase } from '../sync-base';

let mtimeConfigsPath: string;
let mtimeConfigs: any = {};

if (EDITOR) {
    mtimeConfigsPath = path.join(projectPath, 'temp/cocos-sync/mtime.json');
    if (fse.existsSync(mtimeConfigsPath)) {
        mtimeConfigs = fse.readJSONSync(mtimeConfigsPath);
    }
}

export class SyncAsset extends SyncBase {
    static clsName = 'cc.Asset';

    static async import (data: SyncAssetData) {
    }

    static calcPath (data: SyncAssetData, sceneData: SyncSceneData) {
        data.srcPath = data.srcPath || path.join(sceneData.assetBasePath, data.path);

        data.dstPath = path.join(projectAssetPath, sceneData.exportBasePath, data.path);
        data.dstUrl = `db://assets/${path.join(sceneData.exportBasePath, data.path)}`;
    }

    static async needSync (data: SyncAssetData) {
        if (data.virtualAsset) {
            return true;
        }
        if (data.shouldCheckSrc && !fse.existsSync(data.srcPath)) {
            return false;
        }

        const srcStats = fse.statSync(data.srcPath);
        let mtime = srcStats.mtime.toJSON();

        if (mtimeConfigs[data.srcPath] === mtime && fse.existsSync(data.dstPath)) {
            return false;
        }

        mtimeConfigs[data.srcPath] = mtime;

        fse.ensureDirSync(path.dirname(mtimeConfigsPath));
        fse.writeJSONSync(mtimeConfigsPath, mtimeConfigs);

        return true;
    }

    static async load (data: SyncAssetData) {
        data.asset = await AssetOpration.loadAssetByUrl(data.dstUrl);
    }

    static async save (data: SyncAssetData, asset: Asset | string) {
        if (asset instanceof Asset) {
            asset = cce.Utils.serialize(asset);
        }
        if (typeof asset !== 'string') {
            asset = JSON.stringify(asset, null, 4);
        }

        if (!fse.existsSync(data.dstPath)) {
            await Editor.Message.request('asset-db', 'create-asset', data.dstUrl, asset);
        }
        else {
            const uuid = await Editor.Message.request('asset-db', 'query-uuid', data.dstUrl);
            await cce.Ipc.send('save-asset', uuid, asset)
        }
    }

    static async sync (data: SyncAssetData, sceneData: SyncSceneData) {
        // log(`Time 1: ${Date.now() / 1000}`);

        this.calcPath(data, sceneData);

        let forceSyncAsset = false;

        let regs = sceneData.forceSyncAsset.split(',');
        regs.forEach(reg => {
            if (!reg) return;
            if (new RegExp(reg).test(data.srcPath.toLowerCase())) {
                forceSyncAsset = true;
            }
        })

        if (sceneData.forceSyncAssetTypes && sceneData.forceSyncAssetTypes.includes(data.name)) {
            forceSyncAsset = true;
        }

        // log(`Time 2: ${Date.now() / 1000}`);

        let needSync = await this.needSync(data) || forceSyncAsset;
        if (needSync) {
            try {
                log(`Syncing asset : ${data.path}`);
                await this.import(data);
            }
            catch (err) {
                error(err);
            }
        }

        // log(`Time 3: ${Date.now() / 1000}`);

        try {
            await this.load(data);
        }
        catch (err) {
            error(err);
        }

        return data;

        // log(`Time 4: ${Date.now() / 1000}`);
    }
}

