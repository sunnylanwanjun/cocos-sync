import { JsonAsset, Material, Mesh, MeshRenderer, Texture2D, Vec4 } from "cc";
import { SyncComponentData, SyncComponent, register } from "./component";
import * as SyncAssets from '../asset';

interface SyncLightMapSetting {
    lightmapColor: string;
    uv: Vec4;
}

export interface SyncMeshRendererData extends SyncComponentData {
    materilas: string[];
    mesh: string;
    lightmapSetting: string;
}

@register
export class SyncMeshRenderer extends SyncComponent {
    static clsName = 'cc.MeshRenderer';

    static import (comp: MeshRenderer, data: SyncMeshRendererData) {
        data.materilas.forEach((uuid, index) => {
            let m = SyncAssets.get(uuid);
            if (m) {
                comp.setMaterial(m as Material, index);
            }
        })

        let lightmapSetting: SyncLightMapSetting | null = null;
        try {
            lightmapSetting = JSON.parse(data.lightmapSetting);
        }
        catch (err) {
            console.error(err);
        }

        if (lightmapSetting) {
            comp.lightmapSettings.texture = SyncAssets.get(lightmapSetting.lightmapColor) as Texture2D;
            comp.lightmapSettings.uvParam = new Vec4(lightmapSetting.uv);
            (comp as any)._onUpdateLightingmap();
        }

        let m = SyncAssets.get(data.mesh) as Mesh;
        comp.mesh = m;
    }
}
