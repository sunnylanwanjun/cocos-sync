import { SyncMeshRendererData } from './mesh-renderer';

export class SyncSkinnedMeshRendererData extends SyncMeshRendererData {
    __type__ = 'cc.SkinnedMeshRenderer';

    skeleton = ''
    rootBonePath = ''
}
