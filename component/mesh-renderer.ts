import { find, js, JsonAsset, Material, Mesh, MeshRenderer, Texture2D, Vec4 } from "cc";
import { SyncComponentData, SyncComponent, register } from "./component";
import * as SyncAssets from '../asset';
import { ReflectionProbe } from '../extend-component/reflection-probe';
import { MeshRendererProbe, ReflectionProbeInfo } from '../extend-component/mesh-renderer-probe';
import { CocosSync } from '../cocos-sync';
import { deserializeData } from '../utils/deserialize';

interface SyncLightMapSetting {
    lightmapColor: string;
    uv: Vec4;
}

interface SyncMeshRendererProbe {
    probePath: string;
    weight: number;
}

export interface SyncMeshRendererData extends SyncComponentData {
    materilas: string[];
    probes: SyncMeshRendererProbe[];
    mesh: string;
    lightmapSetting: string;

    casterShadow: boolean;
    receiveShadow: boolean;
}

@register
export class SyncMeshRenderer extends SyncComponent {
    static comp = MeshRenderer;

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

    static postImport (comp: MeshRenderer, data: SyncMeshRendererData) {
        if (data.probes) {
            let meshRendererProbe = comp.getComponent(MeshRendererProbe);
            if (!meshRendererProbe) {
                meshRendererProbe = comp.addComponent(MeshRendererProbe);
            }
            meshRendererProbe!.reflectionProbeInfos.length = 0;

            data.probes.forEach(probe => {
                probe = deserializeData(probe);

                let node = find(CocosSync.Export_Base + '/' + probe.probePath);
                if (node) {
                    let reflectionProbe = node.getComponent(js.getClassName(ReflectionProbe)) as ReflectionProbe;
                    if (!reflectionProbe) {
                        reflectionProbe = node.addComponent(js.getClassName(ReflectionProbe)) as ReflectionProbe;
                    }

                    let info = new ReflectionProbeInfo();
                    info.reflectionProbe = reflectionProbe;
                    info.weight = probe.weight;
                    meshRendererProbe!.reflectionProbeInfos.push(info);
                }
            })
        }
    }
}
