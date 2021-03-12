import { Node } from 'cc';
import { SyncComponentData } from './component/component';

export class SyncNodeData implements ISyncDataBase {
    __type__ = 'cc.Node';

    name = '';
    uuid = '';

    position: IVec3 | undefined;
    scale: IVec3 | undefined;
    eulerAngles: IVec3 | undefined;
    rotation: IQuat | undefined;

    children: (SyncNodeData | string)[] = [];
    components: (SyncComponentData | string)[] = [];

    needMerge: boolean = false;

    // only in creator
    parentIndex = -1;
    node: Node | undefined;

    mergeToNodeIndex = -1;
    matrix: IMat4 | undefined;
}


