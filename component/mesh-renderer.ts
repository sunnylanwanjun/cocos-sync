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

    casterShadow: boolean;
    receiveShadow: boolean;
}

@register
export class SyncMeshRenderer extends SyncComponent {
    static clsName = 'cc.MeshRenderer';

    static import (comp: MeshRenderer, data: SyncMeshRendererData) {
        comp.shadowCastingMode = data.casterShadow ? MeshRenderer.ShadowCastingMode.ON : MeshRenderer.ShadowCastingMode.OFF;
        comp.receiveShadow = data.receiveShadow ? MeshRenderer.ShadowReceivingMode.ON : MeshRenderer.ShadowReceivingMode.OFF;

        let lightmapSetting: SyncLightMapSetting | null = null;
        if (data.lightmapSetting) {
            try {
                lightmapSetting = JSON.parse(data.lightmapSetting);
            }
            catch (err) {
                console.error(err);
            }
        }

        if (lightmapSetting) {
            comp.lightmapSettings.texture = SyncAssets.get(lightmapSetting.lightmapColor) as Texture2D;
            comp.lightmapSettings.uvParam = new Vec4(lightmapSetting.uv);
            (comp as any)._onUpdateLightingmap();
        }

        data.materilas.forEach((uuid, index) => {
            let m = SyncAssets.get(uuid);
            if (m) {
                comp.setMaterial(m as Material, index);
            }
        })

        let m = SyncAssets.get(data.mesh) as Mesh;
        comp.mesh = m;
    }
}
