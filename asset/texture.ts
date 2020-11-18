import { Asset } from "cc";
import { loadAssetByUrl } from "../utils/asset-operation";
import { cce, Editor, fse, path, projectAssetPath } from "../utils/editor";
import { register, SyncAsset, SyncAssetData } from "./asset";

export interface SyncTextureData extends SyncAssetData {
}

@register
export class SyncTexture extends SyncAsset {
    static clsName = 'cc.Texture';

    static calcPath (data: SyncAssetData, assetBasePath: string) {
        data.srcPath = path.join(assetBasePath, data.path);
        data.dstPath = path.join(projectAssetPath, data.path);
        data.dstUrl = `db://assets/${data.path}/texture`;
    }

    static async sync (data: SyncTextureData, assetBasePath: string) {
        fse.ensureDirSync(path.dirname(data.dstPath));
        fse.copyFileSync(data.srcPath, data.dstPath);
    }
}

