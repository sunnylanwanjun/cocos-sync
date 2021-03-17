
import { Component, MeshRenderer, TextureCube, Vec4, _decorator, __private } from 'cc';
import { cce, EDITOR } from '../utils/editor';

const { ccclass, type, executeInEditMode } = _decorator;

@ccclass('sync.LightmapSetting')
@executeInEditMode
export class LightmapSetting extends Component {
    @type(Vec4)
    addVector: Vec4[] = [];

    @type(Vec4)
    scaleVector: Vec4[] = [];

    start () {
        if (EDITOR) {
            cce.Asset.on('asset-refresh', this.updateMaterials.bind(this));
        }

        this.updateMaterials('**');

    }

    updateMaterials (uuid: string) {
        let meshRenderer = this.getComponent(MeshRenderer);
        if (meshRenderer) {

            if (meshRenderer.model) {
                meshRenderer.model.subModels.forEach((sm, index) => {
                    // let macros = meshRenderer!.model!.getMacroPatches(index);
                    // macros = macros ? macros.concat() : [];
                    // macros.push({ name: 'CC_USE_LIGHTMAP', value: true })

                    let macros: any[] = (sm as any)._patches || [];
                    let m = macros.find(m => m.name === 'CC_USE_LIGHTMAP');
                    if (m) {
                        m.value = true;
                    }
                    else {
                        macros.push({ name: 'CC_USE_LIGHTMAP', value: true });
                    }

                    sm.onMacroPatchesStateChanged(macros);
                })
            }

            let materials = meshRenderer.sharedMaterials;
            for (let i = 0, l = materials.length; i < l; i++) {
                if (uuid !== '**' && materials[i]?._uuid !== uuid) {
                    continue;
                }
                let m = meshRenderer.getMaterialInstance(i);
                if (!m) continue;

                m.setProperty('LightMapScale', this.scaleVector);
                m.setProperty('LightMapAdd', this.addVector);
            }
        }
    }
}
