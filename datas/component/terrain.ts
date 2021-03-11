import { SyncComponentData } from "./component";

export class SyncTerrainLayer {
    name = '';
}

export class SyncTerrainData implements SyncComponentData {
    __type__ = 'cc.Terrain';

    heightmapWidth = 0;
    heightmapHeight = 0;
    heightDatas: number[] = [];

    terrainLayers: SyncTerrainLayer[] = [];
    weightmapWidth = 0;
    weightmapHeight = 0;
    weightDatas: number[] = [];

    terrainWidth = 0;
    terrainHeight = 0;
}
