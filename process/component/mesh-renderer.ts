import { find, js, JsonAsset, Material, Mesh, MeshRenderer, Texture2D, Vec4 } from "cc";
import { SyncComponent } from "./component";
import { ReflectionProbe } from '../../extend-component/reflection-probe';
import { MeshRendererProbe, ReflectionProbeInfo } from '../../extend-component/mesh-renderer-probe';
import { deserializeData } from '../../utils/deserialize';
import { LightmapSetting } from '../../extend-component/lightmap-setting';
import { register } from "../register";
import { SyncMeshRendererData } from "../../datas/component/mesh-renderer";

@register
export class SyncMeshRenderer extends SyncComponent {
    static DATA = SyncMeshRendererData;

    static import (comp: MeshRenderer, data: SyncMeshRendererData) {
        comp.shadowCastingMode = data.casterShadow ? MeshRenderer.ShadowCastingMode.ON : MeshRenderer.ShadowCastingMode.OFF;
        comp.receiveShadow = data.receiveShadow ? MeshRenderer.ShadowReceivingMode.ON : MeshRenderer.ShadowReceivingMode.OFF;

        let lightMapValid = false;
        if (data.lightmapSetting) {
            let lightmapSetting = deserializeData(data.lightmapSetting);

            if (lightmapSetting) {
                comp.lightmapSettings.texture = CocosSync.get(lightmapSetting.lightmapColor) as Texture2D;
                comp.lightmapSettings.uvParam = new Vec4(lightmapSetting.uv);
                (comp as any)._onUpdateLightingmap();

                if (comp.lightmapSettings.texture && lightmapSetting.addVector && lightmapSetting.scaleVector) {
                    let settingComp = comp.node.getComponent(js.getClassName(LightmapSetting)) as LightmapSetting;
                    if (!settingComp) {
                        settingComp = comp.node.addComponent(js.getClassName(LightmapSetting)) as LightmapSetting
                    }

                    settingComp.addVector = lightmapSetting.addVector.map(v => new Vec4(v));
                    settingComp.scaleVector = lightmapSetting.scaleVector.map(v => new Vec4(v));

                    lightMapValid = true;
                }
            }
        }

        if (!lightMapValid) {
            let settingComp = comp.node.getComponent(js.getClassName(LightmapSetting));
            if (settingComp) {
                settingComp.destroy();
            }
        }

        data.materilas.forEach((uuid, index) => {
            let m = CocosSync.get(uuid);
            if (m) {
                comp.setMaterial(m as Material, index);
            }
        })

        let m = CocosSync.get(data.mesh) as Mesh;
        comp.mesh = m;

        if (comp.model && comp.model.subModels) {
            for (let i = data.materilas.length; i < comp.model!.subModels!.length; i++) {
                comp.setMaterial(comp.sharedMaterials[0], i);
            }
        }
    }

    static postImport (comp: MeshRenderer, data: SyncMeshRendererData) {
        if (data.probes && data.probes.length) {
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
