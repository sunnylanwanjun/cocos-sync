import { SyncNodeData } from "./node";

export interface SyncSceneData {
    nodeCount: number;
    componentCount: number;
    children: SyncNodeData[];

    exportBasePath: string;
    assetBasePath: string;
    forceSyncAsset: string;
    assets: string[];
}
