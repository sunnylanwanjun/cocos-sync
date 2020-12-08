import { Asset } from 'cc';
import { EDITOR } from 'cce:env';
import { loadAssetByUrl } from '../utils/asset-operation';
import { fse, path, projectAssetPath, projectPath } from '../utils/editor';

export interface SyncAssetData {
    name: string;
    uuid: string;
    path: string;

    // runtime
    asset: Asset | null;

    srcPath: string;
    dstPath: string;
    dstUrl: string;
}

let mtimeConfigsPath: string;
let mtimeConfigs: any = {};

if (EDITOR) {
    mtimeConfigsPath = path.join(projectPath, 'temp/cocos-sync/mtime.json');
    if (fse.existsSync(mtimeConfigsPath)) {
        mtimeConfigs = fse.readJSONSync(mtimeConfigsPath);
    }
}

export class SyncAsset {
    static clsName = 'cc.Asset';

    static calcPath (data: SyncAssetData, assetBasePath: string) {
        data.srcPath = path.join(assetBasePath, data.path);
        data.dstPath = path.join(projectAssetPath, data.path);
        data.dstUrl = `db://assets/${data.path}`;
    }

    static async sync (data: SyncAssetData, assetBasePath: string) {
        data;
    }

    static async needSync (data: SyncAssetData) {
        if (!fse.existsSync(data.srcPath)) {
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
        data.asset = await loadAssetByUrl(data.dstUrl);
    }
}

export const classes: Map<string, typeof SyncAsset> = new Map();
export function register (cls: typeof SyncAsset) {
    classes.set(cls.clsName, cls);
}
