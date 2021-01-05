import { Color, DirectionalLight, Light, SphereLight, SpotLight } from 'cc';
import { register, SyncComponentData, SyncComponent } from './component';

export interface SyncLightData extends SyncComponentData {
    range: number;
    size: number;
    luminance: number;
    color: number[]
}

export class SyncLight extends SyncComponent {
    static import (comp: Light, data: SyncLightData) {
        comp.color = new Color(data.color[0] * 255, data.color[1] * 255, data.color[2] * 255, data.color[3] * 255);
    }
}

@register
export class SyncSphereLight extends SyncLight {
    static clsName = 'cc.SphereLight';
    static import (comp: SphereLight, data: SyncLightData) {
        super.import(comp, data);

        comp.range = data.range;
        comp.size = data.size;
        comp.term = Light.PhotometricTerm.LUMINANCE;
        comp.luminance = data.luminance;
    }
}

@register
export class SyncDirectionalLight extends SyncLight {
    static clsName = 'cc.DirectionalLight';
    static import (comp: DirectionalLight, data: SyncLightData) {
        super.import(comp, data);

        comp.illuminance = data.luminance;
    }
}

@register
export class SyncSpotLight extends SyncLight {
    static clsName = 'cc.SpotLight';
    static import (comp: SpotLight, data: SyncLightData) {
        super.import(comp, data);
    }
}
