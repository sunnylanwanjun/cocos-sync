import { SyncSceneData } from "../scene";
import { Editor, fse, path, projectAssetPath } from "../utils/editor";
import { register, SyncAsset, SyncAssetData } from "./asset";

export interface SyncTextureData extends SyncAssetData {
}

@register
export class SyncTexture extends SyncAsset {
    static clsName = 'cc.Texture';

    static calcPath (data: SyncAssetData, sceneData: SyncSceneData) {
        data.srcPath = path.join(sceneData.assetBasePath, data.path);
        data.dstPath = path.join(projectAssetPath, sceneData.exportBasePath, data.path);
        data.dstUrl = `db://assets/${path.join(sceneData.exportBasePath, data.path)}/texture`;
    }

    static async sync (data: SyncTextureData, assetBasePath: string) {
        fse.ensureDirSync(path.dirname(data.dstPath));
        fse.copyFileSync(data.srcPath, data.dstPath);
        await Editor.Message.request('asset-db', 'refresh-asset', data.dstUrl);
    }
}

