import { SyncComponentData } from './component';

export class SyncLightData extends SyncComponentData {
    range = 0;
    size = 0;
    intensity = 1;
    temperature = 6500;
    useTemperature = false;
    color: number[] = [];
}
