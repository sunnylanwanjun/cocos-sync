import { SyncAssetData } from 'datas/asset/asset';
import { BlendFactor, CullMode } from 'datas/gfx';
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
    name: string;
    value: string;
    type: SyncMaterialPropertyType;
}


export class SyncPassStateData {
    cullMode: CullMode;
    blendSrc: BlendFactor;
    blendDst: BlendFactor;
    depthTest: boolean;
    depthWrite: boolean;
}

export class SyncMaterialData extends SyncAssetData {
    name = 'cc.Material';

    shaderType: ShaderType = ShaderType.Source;
    shaderUuid: string;
    properties: SyncMaterialPropertyData[] = [];
    passState: SyncPassStateData;
    hasLightMap: boolean;
    technique: string;
    defines: string[] = [];
}
