import { TextureCube, _decorator } from "cc";
import { SyncComponentData, SyncComponent, register } from "./component";
import * as SyncAssets from '../asset';
import { ReflectionProbe } from '../extend-component/reflection-probe';

export interface SyncReflectionProbeData extends SyncComponentData {
    bakedTexture: string;
}

@register
export class SyncReflectionProbe extends SyncComponent {
    static comp = ReflectionProbe;

    static import (comp: ReflectionProbe, data: SyncReflectionProbeData) {
        var asset = SyncAssets.get(data.bakedTexture) as TextureCube;

        if (Array.isArray(asset)) {
            comp.mipmaps = asset as any as TextureCube[];
        }
        else {
            comp.mipmaps = [asset];
        }
    }
}
