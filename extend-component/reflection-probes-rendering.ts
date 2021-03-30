import { Component, DeferredPipeline, director, find, LightingFlow, LightingStage, Material, _decorator } from 'cc';
import { warn } from '../utils/editor';
import { ReflectionProbe } from './reflection-probe';

const { ccclass, executeInEditMode } = _decorator

@ccclass('sync.ReflectionProbesRendering')
@executeInEditMode
export class ReflectionProbesRendering extends Component {
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

        let probes = this.getComponentsInChildren(ReflectionProbe);
        probes.forEach((probe, index) => {
            material.setProperty(`envMap_${index}`, probe.cube);
        })
        material.passes.forEach(p => p.update());
    }
}
