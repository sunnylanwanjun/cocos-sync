import { Vec3 } from 'utils/math';
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
    name = 'cc.Mesh';

    meshName: string;

    min: Vec3;
    max: Vec3;

    detail: SyncMeshDataDetail;
}

export class SyncMeshDataDetail {
    min: Vec3;
    max: Vec3;

    subMeshes: SyncSubMeshData[] = [];
}
