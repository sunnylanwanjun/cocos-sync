import { SyncComponentData } from './component';

export class SyncLightMapSetting {
    lightmapColor = '';
    uv: IVec4 | undefined;
    scaleVector: IVec4[] = [];
    addVector: IVec4[] = [];
}

export class SyncMeshRendererProbe {
    probePath = '';
    weight = 0;
}

export class SyncMeshRendererData implements SyncComponentData {
    __type__ = 'cc.MeshRenderer';

    materilas: string[] = [];
    probes: SyncMeshRendererProbe[] = [];
    mesh = '';
    lightmapSetting: SyncLightMapSetting | string = '';

    casterShadow = false;
    receiveShadow = false;
}
