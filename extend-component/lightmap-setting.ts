
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
        this.updateMaterials('**');

    }

    onEnable () {
        if (EDITOR) {
            this.updateMaterials = this.updateMaterials.bind(this);
            cce.Asset.on('asset-refresh', this.updateMaterials);
        }
    }

    onDisable () {
        if (EDITOR) {
            cce.Asset.on('asset-refresh', this.updateMaterials);
        }
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
                    //@ts-ignore
                    meshRenderer?.model._updateAttributesAndBinding(index);
                })

                this.addVector.forEach((v, index) => {
                    let lightingMapAdds: number[] = []
                    Vec4.toArray(lightingMapAdds, v);
                    meshRenderer!.setInstancedAttribute('a_lightingMapAdds' + index, lightingMapAdds)
                })

                this.scaleVector.forEach((v, index) => {
                    let lightingMapScales: number[] = []
                    Vec4.toArray(lightingMapScales, v);
                    meshRenderer!.setInstancedAttribute('a_lightingMapScales' + index, lightingMapScales)
                })
                //@ts-ignore
                meshRenderer._onUpdateLightingmap();
            }
        }
    }
}
