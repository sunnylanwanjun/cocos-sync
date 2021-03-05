import { Color, DirectionalLight, Light, SphereLight, SpotLight } from 'cc';
import { register, SyncComponentData, SyncComponent } from './component';

export interface SyncLightData extends SyncComponentData {
    range: number;
    size: number;
    intensity: number;
    color: number[]
    temperature: number;
    useTemperature: boolean;
}

export class SyncLight extends SyncComponent {
    static import (comp: Light, data: SyncLightData) {
        comp.color = new Color(data.color[0] * 255, data.color[1] * 255, data.color[2] * 255, data.color[3] * 255);
    }
}

@register
export class SyncSphereLight extends SyncLight {
    static comp = SphereLight;

    static import (comp: SphereLight, data: SyncLightData) {
        super.import(comp, data);

        comp.range = data.range;
        comp.size = data.size;
        comp.term = Light.PhotometricTerm.LUMINANCE;
        comp.luminance = data.intensity;
    }
}

@register
export class SyncDirectionalLight extends SyncLight {
    static comp = DirectionalLight;
    static import (comp: DirectionalLight, data: SyncLightData) {
        super.import(comp, data);

        // Aperture: F16_0
        // Shutter: D125
        // ISO: ISO100
        let ev100 = 14.965784284662087;

        comp.illuminance = Math.floor(data.intensity / (0.833333 / (2.0 ** ev100)));
    }
}

@register
export class SyncSpotLight extends SyncLight {
    static comp = SpotLight;
    static import (comp: SpotLight, data: SyncLightData) {
        super.import(comp, data);
    }
}
