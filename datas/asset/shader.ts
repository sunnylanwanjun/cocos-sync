import { SyncAssetData } from './asset';

export enum ShaderType {
    Standard,
    ShaderGraph,
    Source,
    IPhone_LightMap,
    IPhone_SolidTexture,
    IPhone_AlphaBlend_TwoSides,
}

export class SyncShaderData extends SyncAssetData {
    __type__ = 'cc.Shader';

    shaderType: ShaderType = ShaderType.Source;
    source = ''
}
