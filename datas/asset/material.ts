import { BlendFactor, CullMode } from '../gfx';
import { SyncAssetData } from './asset';
import { ShaderType } from './shader';


export enum SyncMaterialPropertyType {
    //
    // Summary:
    //     The property holds a Vector4 value representing a color.
    Color = 0,
    //
    // Summary:
    //     The property holds a Vector4 value.
    Vector = 1,
    //
    // Summary:
    //     The property holds a floating number value.
    Float = 2,
    //
    // Summary:
    //     The property holds a floating number value in a certain range.
    Range = 3,
    //
    // Summary:
    //     The property holds a Texture object.
    Texture = 4
}

export class SyncMaterialPropertyData {
    name = '';
    value = '';
    type = SyncMaterialPropertyType.Color;
}


export class SyncPassStateData {
    cullMode = CullMode.BACK;
    blendSrc = BlendFactor.SRC_ALPHA;
    blendDst = BlendFactor.ONE_MINUS_SRC_ALPHA;
    depthTest = true;
    depthWrite = false;
}

export class SyncMaterialData extends SyncAssetData {
    __type__ = 'cc.Material';

    shaderType: ShaderType = ShaderType.Source;
    shaderUuid = '';
    properties: SyncMaterialPropertyData[] = [];
    passState: SyncPassStateData | undefined;
    hasLightMap = false;
    technique = '';
    defines: string[] = [];
}
