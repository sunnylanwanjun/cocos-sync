import { Vec3 } from 'cc';
import { SyncAssetData } from './asset';


export class SyncSubMeshData {
    vertices: number[] = [];
    uv: number[] = [];
    uv1: number[] = [];
    normals: number[] = [];
    colors: number[] = [];
    boneWeights: number[] = [];
    tangents: number[] = [];

    indices: number[] = [];
}

export class SyncMeshData extends SyncAssetData {
    __type__ = 'cc.Mesh';

    meshName = '';

    min = Vec3;
    max = Vec3;

    detail: SyncMeshDataDetail | undefined;
}

export class SyncMeshDataDetail {
    min = Vec3;
    max = Vec3;

    subMeshes: SyncSubMeshData[] = [];
}
