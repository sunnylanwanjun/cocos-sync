import { CCClass, CCObject, Component, MeshRenderer, _decorator } from 'cc';
import { EDITOR } from 'cc/env';
import { cce } from '../utils/editor';
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

    _materialDirty = false;

    start () {
        if (EDITOR) {
            cce.Asset.on('asset-refresh', this.updateMaterials.bind(this));
        }

        this.updateMaterials('**');
    }

    updateMaterials (uuid: string) {
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
                let materials = meshRenderer.sharedMaterials;
                for (let i = 0, l = materials.length; i < l; i++) {
                    if (uuid !== '**' && materials[i]?._uuid !== uuid) {
                        continue;
                    }
                    let m = meshRenderer.getMaterialInstance(i);
                    if (!m) continue;
                    m.setProperty('envMap', envMap!);
                }
            }
        }
    }
}
