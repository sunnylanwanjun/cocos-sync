import { IQuatLike, IVec3Like, Mat4, Node } from "cc";
import { SyncComponentData } from './component/component';

export interface SyncNodeData {
    name: string;
    uuid: string;

    position: IVec3Like;
    scale: IVec3Like;
    eulerAngles: IVec3Like;
    rotation: IQuatLike;

    children: (SyncNodeData | string)[];
    components: (SyncComponentData | string)[];

    needMerge: boolean;

    // runtime
    parentIndex: number;
    node: Node;

    mergeToNodeIndex: number;
    matrix: Mat4;
}
