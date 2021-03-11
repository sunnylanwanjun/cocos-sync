import { SyncAssetData } from "./asset";

export class SyncSkeletonData extends SyncAssetData {
    __type__ = 'cc.Skeleton';

    bones: string[] = [];
    bindposes: string[] = [];
}
