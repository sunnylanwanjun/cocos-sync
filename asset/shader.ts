import { SyncSceneData } from "../scene";
import { Editor, path, projectAssetPath } from "../utils/editor";
import { register, SyncAsset, SyncAssetData } from "./asset";
import { fse } from '../utils/editor';

export enum ShaderType {
    Standard,
    ShaderGraph,
    Source,
}

export interface SyncShaderData extends SyncAssetData {
    shaderType: ShaderType;
    source: string
}

@register
export class SyncShader extends SyncAsset {
    static clsName = 'cc.Shader';

    static calcPath (data: SyncShaderData, sceneData: SyncSceneData) {
        data.srcPath = data.srcPath || path.join(sceneData.assetBasePath, data.path);

        let extname: string = path.extname(data.path);
        data.path = data.path.replace(extname, '') + '.effect';
        data.dstPath = path.join(projectAssetPath, sceneData.exportBasePath, data.path);
        data.dstUrl = `db://assets/${path.join(sceneData.exportBasePath, data.path)}`;
    }

    static async needSync (data: SyncShaderData) {
        if (data.shaderType === ShaderType.Standard) {
            return false;
        }

        return super.needSync(data);
    }

    static async sync (data: SyncShaderData) {
        if (data.shaderType === ShaderType.ShaderGraph) {
            await Editor.Message.request('shader-graph', 'convert', data.srcPath, data.dstPath);
        }
        else if (data.shaderType === ShaderType.Source) {
            await this.save(data, data.source);
        }
    }

    static async load (data: SyncShaderData) {
        data.asset = data as any;
    }
}

