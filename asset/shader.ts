import { SyncSceneData } from "../scene";
import { Editor, path, projectAssetPath } from "../utils/editor";
import { register, SyncAsset, SyncAssetData } from "./asset";

export interface SyncShaderData extends SyncAssetData {
}

@register
export class SyncShader extends SyncAsset {
    static clsName = 'cc.Shader';

    static calcPath (data: SyncAssetData, sceneData: SyncSceneData) {
        data.srcPath = data.srcPath || path.join(sceneData.assetBasePath, data.path);

        let extname: string = path.extname(data.path);
        data.path = data.path.replace(extname, '') + '.effect';
        data.dstPath = path.join(projectAssetPath, sceneData.exportBasePath, data.path);
        data.dstUrl = `db://assets/${path.join(sceneData.exportBasePath, data.path)}`;
    }

    static async needSync (data: SyncAssetData) {
        let extname: string = path.extname(data.srcPath);
        if (extname.toLowerCase() !== '.shadergraph') {
            return false;
        }

        return super.needSync(data);
    }

    static async sync (data: SyncShaderData) {
        await Editor.Message.request('shader-graph', 'convert', data.srcPath, data.dstPath);
    }

    static async load (data: SyncShaderData) {
        data.asset = data as any;
    }
}

