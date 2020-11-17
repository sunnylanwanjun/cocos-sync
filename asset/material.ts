import { Asset } from "cc";
import { loadAssetByUrl } from "../utils/asset-operation";
import { cce, Editor, fse, path, projectAssetPath } from "../utils/editor";
import { register, SyncAsset, SyncAssetData } from "./asset";

import * as SyncAssets from './index';
import { SyncShaderData } from './shader';

export interface SyncMaterialData extends SyncAssetData {
    shaderUuid: string;
}

@register
export class SyncMaterial extends SyncAsset {
    static clsName = 'cc.Material';

    static calcPath (data: SyncAssetData, assetBasePath: string) {
        data.path = data.path.replace(path.extname(data.path), '') + '.mtl';
        data.srcPath = path.join(assetBasePath, data.path);
        data.dstPath = path.join(projectAssetPath, data.path);
        data.dstUrl = `db://assets/${data.path}`;
    }

    static async sync (data: SyncMaterialData, assetBasePath: string) {
        const defaultUrl = 'db://internal/default-material.mtl';
        const defaultUuid = await Editor.Message.request('asset-db', 'query-uuid', defaultUrl);
        const materialDump = await cce.Asset.queryMaterial(defaultUuid);
        if (materialDump) {
            materialDump.data.forEach(t => {
                t.passes.forEach(p => {
                    let instanceDef = p.defines.find(d => d.name === 'USE_INSTANCING');
                    if (instanceDef) {
                        instanceDef.value = true;
                    }
                })
            })
        }

        let shaderData = SyncAssets.get(data.shaderUuid) as any as SyncShaderData;

        let mtlStr = await cce.Asset.decodeMaterial(materialDump);

        let mtl = JSON.parse(mtlStr);

        if (shaderData && fse.existsSync(shaderData.dstPath)) {
            const shaderUrl = `db://assets/${shaderData.path}`;
            const shaderUuid = await Editor.Message.request('asset-db', 'query-uuid', shaderUrl);
            if (!mtl._effectAsset) {
                mtl._effectAsset = {}
            }
            mtl._effectAsset.__uuid__ = shaderUuid;
        }
        
        mtlStr = JSON.stringify(mtl);

        if (!fse.existsSync(data.dstPath)) {
            await Editor.Message.request('asset-db', 'create-asset', dstUrl, mtlStr);
        }
        else {
            const uuid = await Editor.Message.request('asset-db', 'query-uuid', dstUrl);
            await Editor.Message.request('asset-db', 'save-asset', uuid, mtlStr);
        }
    }
}

