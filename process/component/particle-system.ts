import { SyncParticleSystemData } from "../../datas/component/particle-system/particle-system";
import { SyncComponent } from "./component";
import { register } from "../register";
import { AnimationCurve, CurveRange as CurveRangeData, Keyframe } from "../../datas/component/particle-system/curve-range";
import { GradientRange as GradientRangeData } from "../../datas/component/particle-system/gradient-range";
import { Color, CurveRange, GradientRange, ParticleSystem } from "cc";
import { geometry } from "cc";
import { __private } from "cc";
import { Gradient } from "../../datas/component/particle-system/gradient";
import { SyncMaterialData } from "../../datas/asset/material";
import { Material } from "cc";

let map = new Map;
map.set(CurveRange, function (data: CurveRangeData) {
    let value = new CurveRange;
    copy(value, data);
    return value;
})
map.set(geometry.AnimationCurve, function (data: AnimationCurve) {
    let value = new geometry.AnimationCurve
    copy(value, data);
    return value;
})
map.set(geometry.Keyframe, function (data: Keyframe) {
    let value = new geometry.Keyframe
    copy(value, data);
    return value;
})

map.set(GradientRange, function (data: GradientRangeData) {
    let value = new GradientRange
    copy(value, data);
    return value;
})

let tempRange = new GradientRange;
let TempGradientCtor = tempRange.gradient.constructor as any;
map.set(TempGradientCtor, function (data: Gradient) {
    let value = new TempGradientCtor
    copy(value, data);
    return value;
})

map.set(Color, function (data: IColor) {
    return new Color(data.r, data.g, data.b, data.a);
})


function copy (dst: any, src: any, strict = true) {
    if (!src || !dst) {
        return;
    }

    for (let key in src) {
        if (key in src) {
            let func = (dst[key] !== undefined) && map.get(dst[key].constructor)
            if (func) {
                dst[key] = func(src[key]);
            }
            else {
                if (Array.isArray(dst[key])) {
                    let dstArray = dst[key];
                    let srcArray = src[key];
                    dstArray.length = 0;
                    let func = (srcArray[0] !== undefined) && map.get(srcArray[0].constructor);
                    for (let i = 0; i < dstArray.length; i++) {
                        if (func) {
                            dstArray[i] = func(srcArray[i])
                        }
                        else {
                            dstArray[i] = srcArray[i];
                        }
                    }
                }
                else {
                    dst[key] = src[key];
                }
            }
        }
        else if (strict) {
            console.warn(`copy may be wrong: ${key} not exists in dst`);
        }
    }
}

function copyAndEnable (module: any, data: any) {
    if (data && module && !(module instanceof ParticleSystem)) {
        (data as any).enable = true;
    }
    copy(module, data);
}

@register
export class SyncParticleSystem extends SyncComponent {
    DATA = SyncParticleSystemData;

    async import (comp: ParticleSystem, data: SyncParticleSystemData) {
        copy(comp, data.main);
        comp.scaleSpace = 1; // local

        if (!data.modules) {
            return;
        }

        copyAndEnable(comp.colorOverLifetimeModule, data.modules.colorOvertime);

        if (data.modules.emission) {
            copyAndEnable(comp, data.modules.emission);
            // data.modules.emission.bursts.forEach(burstData => {
            //     let burst = new Burst()
            //     comp.bursts.push(burst)
            // })
        }

        copyAndEnable(comp.forceOvertimeModule, data.modules.forceOvertime);
        copyAndEnable(comp.limitVelocityOvertimeModule, data.modules.limitVelocityOvertime);

        if (data.modules.renderer) {
            copyAndEnable(comp.renderer, data.modules.renderer);
            comp.renderer.particleMaterial = await CocosSync.get<SyncMaterialData>(data.modules.renderer.materialUuid).asset! as Material;
        }

        copyAndEnable(comp.rotationOvertimeModule, data.modules.rotationOvertime);
        copyAndEnable(comp.shapeModule, data.modules.shape);
        copyAndEnable(comp.sizeOvertimeModule, data.modules.sizeOvertime);
        copyAndEnable(comp.velocityOvertimeModule, data.modules.velocityOvertime);

    }
}
