import { builtinResMgr, Camera, Component, DeferredPipeline, director, find, LightingFlow, LightingStage, Material, TextureCube, Vec3, Vec4, _decorator } from 'cc';
import { EDITOR } from 'cc/env';
import { cce, warn } from '../utils/editor';
import { ReflectionProbe } from './reflection-probe';
import { SkyLight } from './skylight';

const { ccclass, executeInEditMode } = _decorator

@ccclass('sync.ReflectionProbesRendering')
@executeInEditMode
export class ReflectionProbesRendering extends Component {
    probes: ReflectionProbe[] = [];
    skylights: SkyLight[] = [];
    material: Material | undefined;

    start () {
        let pipeline = director.root!.pipeline;
        if (!(pipeline instanceof DeferredPipeline)) {
            warn(`ReflectionProbesRendering : pipeline [${pipeline}] is not a DeferredPipeline.`)
            return;
        }

        let flow = pipeline.flows.find(flow => {
            return flow instanceof LightingFlow;
        })
        if (!flow) {
            warn('ReflectionProbesRendering : Can not find LightingFlow.')
            return;
        }

        let stage = flow.stages.find(stage => {
            return stage instanceof LightingStage;
        })
        if (!stage) {
            warn('ReflectionProbesRendering : Can not find LightingStage.');
            return;
        }

        let material = (stage as LightingStage as any)._deferredMaterial as Material;
        if (!material) {
            warn('ReflectionProbesRendering : Can not find Deferred Material.');
            return;
        }

        this.material = material;
        this.probes = this.getComponentsInChildren(ReflectionProbe);
        this.skylights = this.getComponentsInChildren(SkyLight);
    }

    update () {
        let material = this.material;
        if (!material) {
            return;
        }

        let mainCamera: Camera | null = null;
        if (EDITOR) {
            mainCamera = cce.Camera._camera;
        }
        else {
            mainCamera = director.getScene()!.getComponentInChildren(Camera);
        }
        if (!mainCamera) {
            return;
        }

        let mainCameraPos = mainCamera.node.getWorldPosition();
        let probes = this.probes;
        probes.sort((a, b) => {
            let distA = Vec3.squaredDistance(a.node.getWorldPosition(), mainCameraPos);
            let distB = Vec3.squaredDistance(b.node.getWorldPosition(), mainCameraPos);
            return distA - distB;
        })

        let blackCube = builtinResMgr.get<TextureCube>('black-cube-texture');
        for (let i = 0; i < 2; i++) {
            let probe = probes[i];
            if (probe) {
                material.setProperty(`envMap_ref_${i}`, probe.cube);
                let pos = probe.node.getWorldPosition();
                material.setProperty(`ReflectionPositionsAndRadii_${i}`, new Vec4(pos.x, pos.y, pos.z, probe.radius));
            }
            else {
                material.setProperty(`envMap_ref_${i}`, blackCube);
                material.setProperty(`ReflectionPositionsAndRadii_${i}`, new Vec4(0, 0, 0, -1));
            }
        }

        let skylight = this.skylights[0];
        if (skylight) {
            material.setProperty(`envMap_sky`, skylight.cube);
        }
        else {
            material.setProperty(`envMap_sky`, blackCube);
        }

        material.passes.forEach(p => p.update());
    }
}
