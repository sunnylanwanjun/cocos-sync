import { Asset } from "cc";
import { loadAssetByUrl } from "../utils/asset-operation";
import { cce, Editor, fse, path, projectAssetPath } from "../utils/editor";
import { register, SyncAsset, SyncAssetData } from "./asset";

export interface SyncTextureData extends SyncAssetData {
}

@register
export class SyncTexture extends SyncAsset {
    static clsName = 'cc.Texture';

    static async sync (data: SyncTextureData, assetBasePath: string) {
        fse.ensureDirSync(path.dirname(data.dstPath));
        fse.copyFileSync(data.srcPath, data.dstPath);
    }
}

