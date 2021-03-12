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

    min: IVec3 | undefined;
    max: IVec3 | undefined;

    detail: SyncMeshDataDetail | undefined;
}

export class SyncMeshDataDetail {
    min: IVec3 | undefined;
    max: IVec3 | undefined;

    subMeshes: SyncSubMeshData[] = [];
}
