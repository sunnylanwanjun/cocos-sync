import { SyncAssetData } from './asset';


export enum ShaderType {
    Standard,
    ShaderGraph,
    Source,
}

export class SyncShaderData extends SyncAssetData {
    name = 'cc.Shader';

    shaderType: ShaderType = ShaderType.Source;
    source = ''
}
