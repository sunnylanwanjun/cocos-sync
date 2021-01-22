import { IQuatLike, IVec3Like, Mat4, Node } from "cc";

export interface SyncNodeData {
    name: string;
    uuid: string;

    position: IVec3Like;
    scale: IVec3Like;
    eulerAngles: IVec3Like;
    rotation: IQuatLike;

    children: (SyncNodeData | string)[];
    components: string[];

    needMerge: boolean;

    // runtime
    parentIndex: number;
    node: Node;

    mergeToNodeIndex: number;
    matrix: Mat4;
}
