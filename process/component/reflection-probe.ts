import { TextureCube, _decorator } from "cc";
import { SyncComponent } from "./component";
import { ReflectionProbe } from '../../extend-component/reflection-probe';
import { register } from "../register";
import { SyncReflectionProbeData } from "../../datas/component/reflecction-probe";

@register
export class SyncReflectionProbe extends SyncComponent {
    static DATA = SyncReflectionProbeData;

    static import (comp: ReflectionProbe, data: SyncReflectionProbeData) {
        var asset = CocosSync.get(data.bakedTexture) as TextureCube;

        if (Array.isArray(asset)) {
            comp.mipmaps = asset as any as TextureCube[];
        }
        else {
            comp.mipmaps = [asset];
        }
    }
}
