import { Asset } from "cc";
import { loadAssetByUrl } from "../utils/asset-operation";
import { cce, Editor, fse, path, projectAssetPath } from "../utils/editor";
import { register, SyncAsset, SyncAssetData } from "./asset";

export interface SyncShaderData extends SyncAssetData {
}

@register
export class SyncShader extends SyncAsset {
    static clsName = 'cc.Shader';

    static calcPath (data: SyncAssetData, assetBasePath: string) {
        let extname: string = path.extname(data.path);
        
        data.path = data.path.replace(extname, '') + '.effect';
        data.srcPath = path.join(assetBasePath, data.path);
        data.dstPath = path.join(projectAssetPath, data.path);
        data.dstUrl = `db://assets/${data.path}`;
    }

    static async needSync (data: SyncAssetData) {
        let extname: string = path.extname(data.path);
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

