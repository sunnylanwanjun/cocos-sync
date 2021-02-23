import { Asset, Color, error, gfx, Material, renderer, Texture2D, Vec4 } from "cc";
import { type } from 'os';
import { deserialize } from 'v8';
import { SyncSceneData } from "../scene";
import { AssetOpration } from "../utils/asset-operation";
import { cce, Editor, fse, path, projectAssetPath } from "../utils/editor";
import { register, SyncAsset, SyncAssetData } from "./asset";

import * as SyncAssets from './index';
import { SyncShaderData } from './shader';

enum ShaderPropertyType {
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

interface MaterialConfig {
    url: string
    properties: any
}

const Property2Defines = {
    albedoMap: ['USE_ALBEDO_MAP'],
    metallicGlossMap: ['USE_METAL_SMOOTH_MAP'],
    normalMap: ['USE_NORMAL_MAP'],
    occlusionMap: ['USE_OCCLUSION_MAP'],
    emissiveMap: ['USE_EMISSIVE_MAP'],

    // // unity standard shader
    // "0000000000000000f000000000000000/Standard": {
    //     url: 'db://assets/lib/cocos-sync/builtin/pbr-smoothness.mtl',
    //     properties: {
    //         '_Color': { name: 'mainColor' },
    //         '_MainTex': { name: 'albedoMap', defines: ['USE_ALBEDO_MAP'] },
    //         '_Cutoff': { name: 'alphaThreshold'/*, defines: ['USE_ALPHA_TEST']*/ },
    //         '_Glossiness': { name: 'smoothness', defines: [] },
    //         '_Metallic': { name: 'metallic', defines: [] },
    //         '_MetallicGlossMap': { name: 'metallicGlossMap', defines: ['USE_METAL_SMOOTH_MAP'] },
    //         '_BumpScale': { name: 'normalStrenth' },
    //         '_BumpMap': { name: 'normalMap', defines: ['USE_NORMAL_MAP'] },
    //         '_OcclusionStrength': { name: 'occlusion', defines: [] },
    //         '_OcclusionMap': { name: 'occlusionMap', defines: ['USE_OCCLUSION_MAP'] },
    //         '_EmissionColor': { name: 'emissive', defines: [] },
    //         '_EmissionMap': { name: 'emissiveMap', defines: ['USE_EMISSIVE_MAP'] },

    //         // '_SpecularHighlights': '',
    //         // '_GlossyReflections': '',
    //         // '_GlossMapScale': '',
    //         // '_SmoothnessTextureChannel': '',
    //         // '_Parallax': '',
    //         // '_ParallaxMap': '',
    //         // '_DetailMask': '',
    //         // '_DetailAlbedoMap': '',
    //         // '_DetailNormalMapScale': '',
    //         // '_DetailNormalMap': '',
    //         // '_UVSec': ''
    //     }
    // },
    // "933532a4fcc9baf4fa0491de14d08ed7/Universal Render Pipeline/Lit": {
    //     url: 'db://assets/lib/cocos-sync/builtin/pbr-smoothness.mtl',
    //     properties: {
    //         _BaseColor: { name: 'mainColor' },
    //         _BaseMap: { name: 'albedoMap', defines: ['USE_ALBEDO_MAP'] },
    //         _Cutoff: { name: 'alphaThreshold'/*, defines: ['USE_ALPHA_TEST']*/ },
    //         _Smoothness: { name: 'smoothness', defines: [] },
    //         _Metallic: { name: 'metallic', defines: [] },
    //         _MetallicGlossMap: { name: 'metallicGlossMap', defines: ['USE_METAL_SMOOTH_MAP'] },
    //         _BumpScale: { name: 'normalStrenth' },
    //         _BumpMap: { name: 'normalMap', defines: ['USE_NORMAL_MAP'] },
    //         _OcclusionStrength: { name: 'occlusion', defines: [] },
    //         _OcclusionMap: { name: 'occlusionMap', defines: ['USE_OCCLUSION_MAP'] },
    //         _EmissionColor: { name: 'emissive', defines: [] },
    //         _EmissionMap: { name: 'emissiveMap', defines: ['USE_EMISSIVE_MAP'] },
    //     }
    // }
} as Record<string, string[]>

enum ShaderType {
    Standard,
    ShaderGraph,
}

export interface SyncMaterialPropertyData {
    name: string;
    value: string;
    type: ShaderPropertyType;
}

export interface SyncPassStateData {
    cullMode: gfx.CullMode;
    blendSrc: number;
    blendDst: number;
    depthTest: boolean;
    depthWrite: boolean;
}

export interface SyncMaterialData extends SyncAssetData {
    shaderType: ShaderType;
    shaderUuid: string;
    properties: SyncMaterialPropertyData[];
    passState: SyncPassStateData;
    hasLightMap: boolean;
    technique: string;
    defines: string[];
}

@register
export class SyncMaterial extends SyncAsset {
    static clsName = 'cc.Material';

    static calcPath (data: SyncAssetData, sceneData: SyncSceneData) {
        data.srcPath = data.srcPath || path.join(sceneData.assetBasePath, data.path);

        data.path = data.path.replace(path.extname(data.path), '') + '.mtl';
        data.dstPath = path.join(projectAssetPath, sceneData.exportBasePath, data.path);
        data.dstUrl = `db://assets/${path.join(sceneData.exportBasePath, data.path)}`;
    }

    static async sync (data: SyncMaterialData, assetBasePath: string) {
        let mtlJson: any;

        if (fse.existsSync(data.dstPath)) {
            mtlJson = fse.readJsonSync(data.dstPath);
        }
        else {
            let url = ''
            if (data.shaderType === ShaderType.Standard) {
                url = 'db://assets/lib/cocos-sync/builtin/pbr-smoothness.mtl';
            }
            else {
                url = 'db://internal/default-material.mtl';
            }

            const mtlPath = await Editor.Message.request('asset-db', 'query-path', url);
            mtlJson = fse.readJsonSync(mtlPath);
        }

        let shaderData = SyncAssets.get(data.shaderUuid) as any as SyncShaderData;
        let hasShader = shaderData && fse.existsSync(shaderData.dstPath);
        if (hasShader) {
            const shaderUuid = await Editor.Message.request('asset-db', 'query-uuid', shaderData.dstUrl);
            if (!mtlJson._effectAsset) {
                mtlJson._effectAsset = {}
            }
            if (mtlJson._effectAsset.__uuid__ !== shaderUuid) {
                mtlJson._effectAsset.__uuid__ = shaderUuid;
                await this.save(data, mtlJson);
            }
        }

        if (!fse.existsSync(data.dstPath)) {
            await this.save(data, mtlJson);
        }

        let mtl: Material = await AssetOpration.loadAssetByUrl(data.dstUrl) as Material;

        let properties: any = {};
        let defines: Record<string, boolean> = {};

        for (let pname in Property2Defines) {
            let pdefines = Property2Defines[pname] as string[];
            if (pdefines) {
                pdefines.forEach((pd: string) => {
                    defines[pd] = false;
                })
            }
        }

        data.properties.forEach(p => {
            if (!p.value) {
                return;
            }

            let name = p.name;

            let value;
            if (p.type === ShaderPropertyType.Float) {
                value = Number.parseFloat(p.value);
            }
            else if (p.type === ShaderPropertyType.Texture) {
                value = SyncAssets.get(p.value) as Texture2D || undefined;
            }
            else if (p.type === ShaderPropertyType.Range) {
                value = Number.parseFloat(p.value);
            }
            else {
                try {
                    value = JSON.parse(p.value);
                }
                catch (err) {
                    error(err);
                    return;
                }

                if (p.type === ShaderPropertyType.Color) {
                    let maxVal = Math.max(value.r, value.g, value.b, value.a);
                    let color;
                    if (maxVal > 1) {
                        // hdr color value will big than 1 
                        color = new Vec4() as any as Color;
                    }
                    else {
                        color = new Color();
                    }
                    color.x = value.r;
                    color.y = value.g;
                    color.z = value.b;
                    color.w = value.a;
                    color.r = value.r * 255;
                    color.g = value.g * 255;
                    color.b = value.b * 255;
                    color.a = value.a * 255;
                    value = color;
                }
            }

            if (value !== undefined) {
                Property2Defines[name] && Property2Defines[name].forEach((pd: string) => {
                    defines[pd] = true;
                })
                properties[name] = value;
            }
        })

        // technique
        let techIdx = mtl.effectAsset?.techniques.findIndex(t => {
            return t.name === data.technique;
        })
        if (techIdx === -1) {
            techIdx = 0;
        }
        (mtl as any)._techIdx = techIdx;

        if (data.passState) {
            // pipeline state
            renderer.MaterialInstance.prototype.overridePipelineStates.call(mtl, {
                rasterizerState: {
                    cullMode: data.passState.cullMode,
                },
                // blendState: {
                //     targets: [
                //         {
                //             blendSrc: data.passState.blendSrc,
                //             blendDst: data.passState.blendDst,
                //             blendSrcAlpha: data.passState.blendSrc,
                //             blendDstAlpha: data.passState.blendDst,
                //         }
                //     ]
                // },
                // depthStencilState: {
                //     depthWrite: !data.passState.zWrite,
                // }
            });
        }


        // defines
        (mtl as any)._defines.forEach((d: any) => {
            for (let dn in defines) {
                d[dn] = defines[dn];
            }

            data.defines.forEach(dataDefine => {
                let splits = dataDefine.split('=');
                let key = splits[0].replace(/ /g, '');
                let value = splits[1].replace(/ /g, '');
                d[key] = value;
            })

            d['USE_LIGHTMAP'] = data.hasLightMap;
            d['HAS_SECOND_UV'] = data.hasLightMap;

            // d['USE_INSTANCING'] = data.technique !== 'transparent';
            d['USE_ALPHA_TEST'] = false;
        })

        // properties
        for (let name in properties) {
            mtl.setProperty(name, properties[name]);
        }

        await this.save(data, mtl);
    }
}

