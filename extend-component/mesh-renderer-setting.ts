
import { Component, gfx, MeshRenderer, _decorator } from 'cc';

const { ccclass, executeInEditMode } = _decorator;

@ccclass('sync.MeshRendererSetting')
@executeInEditMode
export class MeshRendererSetting extends Component {

    start () {
        this.updateMaterials('**');
    }

    updateMaterials (uuid: string) {
        let meshRenderer = this.getComponent(MeshRenderer);
        if (meshRenderer) {
            if (meshRenderer.model) {
                let attrMap: any = {}

                meshRenderer.mesh?.struct.vertexBundles.forEach(vb => {
                    vb.attributes.forEach(a => {
                        if (a.name === gfx.AttributeName.ATTR_COLOR) {
                            attrMap['CC_USE_ATTR_COLOR'] = true;
                        }
                    })
                })

                meshRenderer.model.subModels.forEach((sm, index) => {
                    // let macros = meshRenderer!.model!.getMacroPatches(index);
                    // macros = macros ? macros.concat() : [];
                    // for (let name in attrMap) {
                    //     macros.push({ name, value: attrMap[name] })
                    // }

                    let macros: any[] = (sm as any)._patches || [];
                    for (let name in attrMap) {
                        let m = macros.find(m => m.name === name);
                        let value = attrMap[name];
                        if (m) {
                            m.value = true;
                        }
                        else {
                            macros.push({ name, value });
                        }
                    }

                    sm.onMacroPatchesStateChanged(macros);
                })
            }
        }
    }
}
