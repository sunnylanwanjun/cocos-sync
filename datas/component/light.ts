import { SyncComponentData } from "./component";

export abstract class SyncLightData extends SyncComponentData {
    range = 0;
    size = 0;
    intensity = 1;
    temperature = 6500;
    useTemperature = false;
    color: number[] = [];
}


export class SyncDirectionLightData extends SyncLightData {
    __type__ = 'cc.DirectionalLight'
}

export class SyncSphereLightData extends SyncLightData {
    __type__ = 'cc.SphereLight'
}

export class SyncSpotLightData extends SyncLightData {
    __type__ = 'cc.SpotLight'
}
