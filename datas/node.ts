import { Vec3, Quat } from 'cc';
import { SyncComponentData } from './component/component';

export class SyncNodeData implements ISyncDataBase {
    __type__ = 'cc.Node';

    name = '';
    uuid = '';

    position = new Vec3;
    scale = new Vec3;
    eulerAngles = new Vec3;
    rotation = new Quat;

    children: (SyncNodeData | string)[] = [];
    components: (SyncComponentData | string)[] = [];

    needMerge: boolean = false;
}


