import { Component, MeshRenderer, _decorator } from 'cc';
import { ReflectionProbe } from './reflection-probe';

const { ccclass, type, executeInEditMode } = _decorator;

@ccclass('sync.MeshRendererProbe')
@executeInEditMode
export class MeshRendererProbe extends Component {
    @type(ReflectionProbe)
    reflectionProbe: ReflectionProbe | undefined;

    onEnable () {
        let meshRenderer = this.getComponent(MeshRenderer);
        if (meshRenderer && this.reflectionProbe) {
            let envMap = this.reflectionProbe.texture;
            for (let i = 0, l = meshRenderer.sharedMaterials.length; i < l; i++) {
                let m = meshRenderer.getMaterialInstance(i);
                if (!m) continue;
                m.setProperty('envMap', envMap!);
            }
        }
    }
}
