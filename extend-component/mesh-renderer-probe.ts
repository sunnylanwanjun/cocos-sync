import { Component, MeshRenderer, _decorator } from 'cc';
import { ReflectionProbe } from './reflection-probe';

const { ccclass, type, executeInEditMode } = _decorator;

@ccclass('sync.MeshRendererProbe')
@executeInEditMode
export class MeshRendererProbe extends Component {
    @type(ReflectionProbe)
    reflectionProbe: ReflectionProbe | undefined;

    start () {
        let meshRenderer = this.getComponent(MeshRenderer);
        if (meshRenderer && this.reflectionProbe) {
            let envMap = this.reflectionProbe.cube;
            for (let i = 0, l = meshRenderer.sharedMaterials.length; i < l; i++) {
                let m = meshRenderer.getMaterialInstance(i);
                if (!m) continue;
                m.setProperty('envMap', envMap!);
            }
        }
    }
}
