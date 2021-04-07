import { assetManager, builtinResMgr, Camera, Component, DeferredPipeline, director, find, LightingFlow, LightingStage, Material, PostprocessStage, TextureCube, Vec3, Vec4, _decorator } from 'cc';
import { EDITOR } from 'cc/env';
import { cce, error, warn } from '../utils/editor';
import { ReflectionProbe } from './reflection-probe';
import { SkyLight } from './skylight';

const { ccclass, executeInEditMode, property, type } = _decorator

@ccclass('sync.ReflectionProbesRendering')
@executeInEditMode
export class ReflectionProbesRendering extends Component {
    probes: ReflectionProbe[] = [];
    skylights: SkyLight[] = [];

    lightingStage: LightingStage | undefined;
    postProcessStage: PostprocessStage | undefined;

    _lightingMaterial: Material | null = null;
    @type(Material)
    get lightingMaterial () {
        return this._lightingMaterial;
    }
    set lightingMaterial (v) {
        this._lightingMaterial = v;
    }

    _postprocessMaterial: Material | null = null;
    @type(Material)
    get postprocessMaterial () {
        return this._postprocessMaterial;
    }
    set postprocessMaterial (v) {
        this._postprocessMaterial = v;
    }

    async start () {
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

        let lightingStage = flow.stages.find(stage => {
            return stage instanceof LightingStage;
        })
        if (lightingStage) {
            let material = (lightingStage as LightingStage as any)._deferredMaterial as Material;
            if (!material) {
                warn('ReflectionProbesRendering : Can not find Deferred Material.');
                return;
            }

            this.lightingMaterial = material;
            this.lightingStage = lightingStage as LightingStage;
        }

        let postProcessStage = flow.stages.find(stage => {
            return stage instanceof PostprocessStage;
        })
        if (postProcessStage) {
            let material = (postProcessStage as PostprocessStage as any)._postprocessMaterial as Material;
            if (!material) {
                warn('ReflectionProbesRendering : Can not find Post Process Material.');
                return;
            }

            this.postprocessMaterial = material;
            this.postProcessStage = postProcessStage as PostprocessStage;
        }


        if (EDITOR) {
            await this.updateMaterials();
        }

        this.probes = this.getComponentsInChildren(ReflectionProbe);
        this.skylights = this.getComponentsInChildren(SkyLight);
    }

    onEnable () {
        if (EDITOR) {
            this.updateMaterials = this.updateMaterials.bind(this);
            cce.Asset.on('asset-refresh', this.updateMaterials);
        }
    }

    onDestroy () {
        if (EDITOR) {
            cce.Asset.off('asset-refresh', this.updateMaterials);
        }
    }

    async updateMaterials (uuid?: string) {
        if (EDITOR) {
            if (!uuid || (this.lightingMaterial && this.lightingMaterial._uuid === uuid)) {
                await new Promise((resolve, reject) => {
                    assetManager.loadAny(this.lightingMaterial!._uuid, (err: any, material: Material) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        this.lightingMaterial = material;
                        (this.lightingStage as any)._deferredMaterial = material;

                        resolve(null);
                    });
                })
            }

            if (!uuid || (this.postprocessMaterial && this.postprocessMaterial._uuid === uuid)) {
                await new Promise((resolve, reject) => {
                    assetManager.loadAny(this.postprocessMaterial!._uuid, (err: any, material: Material) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        this.postprocessMaterial = material;
                        (this.postProcessStage as any)._postprocessMaterial = material;

                        resolve(null);
                    });
                })
            }

            cce.Engine.repaintInEditMode();
        }
    }

    update () {
        let material = this.lightingMaterial;
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
