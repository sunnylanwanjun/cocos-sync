import { TextureCube, _decorator } from "cc";
import { SyncComponent } from "./component";
import { ReflectionProbe } from '../../extend-component/reflection-probe';
import { register } from "../register";
import { SyncReflectionProbeData } from "../../datas/component/reflecction-probe";
import { SyncTextureData } from '../../datas/asset/texture';

@register
export class SyncReflectionProbe extends SyncComponent {
    DATA = SyncReflectionProbeData;

    import (comp: ReflectionProbe, data: SyncReflectionProbeData) {
        var asset = CocosSync.get<SyncTextureData>(data.bakedTexture).asset! as TextureCube;

        if (Array.isArray(asset)) {
            comp.mipmaps = asset as any as TextureCube[];
        }
        else {
            comp.mipmaps = [asset];
        }

        comp.radius = data.radius;
    }
}
