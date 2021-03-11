import { Vec3, Quat } from '../utils/math';
import { SyncComponentData } from './component/component';

export class SyncNodeData {
    name: string;
    uuid: string;

    position: Vec3;
    scale: Vec3;
    eulerAngles: Vec3;
    rotation: Quat;

    children: (SyncNodeData | string)[];
    components: (SyncComponentData | string)[] = [];

    needMerge: boolean;
}
