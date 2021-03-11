import { SyncComponentData } from "./component";

export class SyncSkinnedMeshRendererData extends SyncComponentData {
    __type__ = 'cc.SkinnedMeshRenderer';

    skeleton = ''
    rootBonePath = ''
}
