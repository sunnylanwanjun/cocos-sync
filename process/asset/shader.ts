import { Editor, path, projectAssetPath } from "../../utils/editor";
import { SyncAsset } from "./asset";
import { SyncShaderData, ShaderType } from "../../datas/asset/shader";
import { register } from "../register";
import { SyncSceneData } from '../../datas/scene';

@register
export class SyncShader extends SyncAsset {
    DATA = SyncShaderData;

    calcPath (data: SyncShaderData, sceneData: SyncSceneData) {
        data.srcPath = data.srcPath || path.join(sceneData.assetBasePath, data.path);

        let extname: string = path.extname(data.path);
        data.path = data.path.replace(extname, '') + '.effect';
        data.dstPath = path.join(projectAssetPath, sceneData.exportBasePath, data.path);
        data.dstUrl = `db://assets/${path.join(sceneData.exportBasePath, data.path)}`;
    }

    async needSync (data: SyncShaderData) {
        if (data.shaderType === ShaderType.Standard) {
            return false;
        }

        return super.needSync(data);
    }

    async import (data: SyncShaderData) {
        if (data.shaderType === ShaderType.ShaderGraph) {
            await Editor.Message.request('shader-graph', 'convert', data.srcPath, data.dstPath);
        }
        else if (data.shaderType === ShaderType.Source) {
            await this.save(data, data.source);
        }
    }

    async load (data: SyncShaderData) {
        data.asset = data as any;
    }
}

