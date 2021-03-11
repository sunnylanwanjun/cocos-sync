import { SyncComponentData } from "./component";

export class SyncAnimatorData extends SyncComponentData {
    __type__ = 'cc.SkeletalAnimation';

    clips: string[] = [];
    avatarMap: string[] = [];
}
