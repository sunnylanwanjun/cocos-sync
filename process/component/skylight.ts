import { TextureCube, _decorator } from "cc";
import { SyncComponent } from "./component";
import { register } from "../register";
import { SyncTextureData } from '../../datas/asset/texture';
import { SyncSkyLightData } from '../../datas/component/sky-light';
import { SkyLight } from '../../extend-component/skylight';

@register
export class SyncSkylight extends SyncComponent {
    DATA = SyncSkyLightData;

    import (comp: SkyLight, data: SyncSkyLightData) {
        var asset = CocosSync.get<SyncTextureData>(data.cubemapUuid).asset! as TextureCube;

        if (Array.isArray(asset)) {
            comp.mipmaps = asset as any as TextureCube[];
        }
        else {
            comp.mipmaps = [asset];
        }

        comp.averageBrightness = data.averageBrightness;
    }
}
