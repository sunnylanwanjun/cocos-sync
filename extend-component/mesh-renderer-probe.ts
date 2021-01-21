import { CCClass, CCObject, Component, MeshRenderer, _decorator } from 'cc';
import { ReflectionProbe } from './reflection-probe';

const { ccclass, type, property, executeInEditMode } = _decorator;

@ccclass('sync.ReflectionProbeInfo')
export class ReflectionProbeInfo extends CCObject {
    @type(ReflectionProbe)
    reflectionProbe: ReflectionProbe | undefined;

    @property
    weight = 1;
}

@ccclass('sync.MeshRendererProbe')
@executeInEditMode
export class MeshRendererProbe extends Component {
    @type(ReflectionProbeInfo)
    reflectionProbeInfos: ReflectionProbeInfo[] = [];

    start () {
        let meshRenderer = this.getComponent(MeshRenderer);
        if (meshRenderer) {
            let reflectionProbeInfo: ReflectionProbeInfo | undefined;
            this.reflectionProbeInfos.forEach(info => {
                if (!reflectionProbeInfo || info.weight > reflectionProbeInfo!.weight) {
                    reflectionProbeInfo = info;
                }
            })
            if (reflectionProbeInfo && reflectionProbeInfo.reflectionProbe) {
                let envMap = reflectionProbeInfo.reflectionProbe.cube;
                for (let i = 0, l = meshRenderer.sharedMaterials.length; i < l; i++) {
                    let m = meshRenderer.getMaterialInstance(i);
                    if (!m) continue;
                    m.setProperty('envMap', envMap!);
                }
            }
        }
    }
}
