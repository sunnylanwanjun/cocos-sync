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

export class SyncMeshRendererData extends SyncComponentData {
    name = 'cc.MeshRenderer';

    materilas: string[] = [];
    probes: SyncMeshRendererProbe[] = [];
    mesh = 0;
    lightmapSetting: SyncLightMapSetting | string = '';

    casterShadow = false;
    receiveShadow = false;
}
