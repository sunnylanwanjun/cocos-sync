import { Asset } from 'cc';
import { loadAssetByUrl } from '../utils/asset-operation';
import { fse, path, projectAssetPath } from '../utils/editor';

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
        
        let metaPath = data.dstPath + '.meta';
        let mtime, content;
        if (fse.existsSync(metaPath)) {
            const srcStats = fse.statSync(data.srcPath);

            try {
                content = fse.readJSONSync(metaPath);
            }
            catch (err) {
            }

            mtime = srcStats.mtime.toJSON();
            if (content && mtime === content.__mtime__) {
                return false;
            }

            content.__mtime__ = mtime;
            fse.writeJSONSync(metaPath, content);
        }

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
