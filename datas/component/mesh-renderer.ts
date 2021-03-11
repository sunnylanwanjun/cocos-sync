import { Vec4 } from 'cc';
import { SyncComponentData } from './component';

export class SyncLightMapSetting {
    lightmapColor = '';
    uv = new Vec4;
    scaleVector: Vec4[] = [];
    addVector: Vec4[] = [];
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
