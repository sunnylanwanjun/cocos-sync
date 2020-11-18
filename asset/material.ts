import { Asset, Color, error, Material, Texture2D } from "cc";
import { type } from 'os';
import { deserialize } from 'v8';
import { loadAssetByUrl } from "../utils/asset-operation";
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

export interface SyncMaterialPropertyData {
    name: string;
    value: string;
    type: ShaderPropertyType;
}

export interface SyncMaterialData extends SyncAssetData {
    shaderUuid: string;
    properties: SyncMaterialPropertyData[];
}

@register
export class SyncMaterial extends SyncAsset {
    static clsName = 'cc.Material';

    static calcPath (data: SyncAssetData, assetBasePath: string) {
        data.srcPath = path.join(assetBasePath, data.path);

        data.path = data.path.replace(path.extname(data.path), '') + '.mtl';
        data.dstPath = path.join(projectAssetPath, data.path);
        data.dstUrl = `db://assets/${data.path}`;
    }

    static async save (data: SyncMaterialData, mtl: any) {
        if (typeof mtl !== 'string') {
            mtl = JSON.stringify(mtl);
        }

        if (!fse.existsSync(data.dstPath)) {
            await Editor.Message.request('asset-db', 'create-asset', data.dstUrl, mtl);
        }
        else {
            const uuid = await Editor.Message.request('asset-db', 'query-uuid', data.dstUrl);
            await Editor.Message.request('asset-db', 'save-asset', uuid, mtl);
        }
    }

    static async sync (data: SyncMaterialData, assetBasePath: string) {
        let mtlJson: any;
        if (fse.existsSync(data.dstPath)) {
            mtlJson = fse.readJsonSync(data.dstPath);
        }
        else {
            const defaultUrl = 'db://internal/default-material.mtl';
            const defaultPath = await Editor.Message.request('asset-db', 'query-path', defaultUrl);
            mtlJson = fse.readJsonSync(defaultPath);
        }

        let shaderData = SyncAssets.get(data.shaderUuid) as any as SyncShaderData;
        if (shaderData && fse.existsSync(shaderData.dstPath)) {
            const shaderUuid = await Editor.Message.request('asset-db', 'query-uuid', shaderData.dstUrl);
            if (!mtlJson._effectAsset) {
                mtlJson._effectAsset = {}
            }
            if (mtlJson._effectAsset.__uuid__ !== shaderUuid) {
                mtlJson._effectAsset.__uuid__ = shaderUuid;
                await this.save(data, mtlJson);
            }

            let mtl: Material = await loadAssetByUrl(data.dstUrl) as Material;
            data.properties.forEach(p => {
                let value;
                if (p.type === ShaderPropertyType.Float) {
                    value = Number.parseFloat(p.value);
                }
                else if (p.type === ShaderPropertyType.Texture) {
                    value = SyncAssets.get(p.value) as Texture2D;
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
                        let color = new Color();
                        color.x = value.r;
                        color.y = value.g;
                        color.z = value.b;
                        color.w = value.a;
                        value = color;
                    }
                }

                if (value !== undefined) {
                    mtl.setProperty(p.name, value);
                }
            })

            // const defaultUuid = await Editor.Message.request('asset-db', 'query-uuid', data.dstUrl);
            // const materialDump = await cce.Asset.queryMaterial(defaultUuid);
            // if (materialDump) {
            //     materialDump.data.forEach((t: any) => {
            //         t.passes.forEach((p: any) => {
            //             let instanceDef = p.defines.find((d: any) => d.name === 'USE_INSTANCING');
            //             if (instanceDef) {
            //                 instanceDef.value = true;
            //             }
            //         })
            //     })

            // }

            mtlJson = cce.Utils.serialize(mtl);
            // mtl = await cce.Asset.decodeMaterial(materialDump);
        }

        await this.save(data, mtlJson);
    }
}

