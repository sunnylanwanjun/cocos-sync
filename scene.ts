import { SyncAssetData } from './asset/asset';
import { SyncNodeData } from "./node";

export interface SyncSceneData {
    nodeCount: number;
    componentCount: number;
    children: (SyncNodeData | string)[];

    editorView: SyncNodeData;

    exportBasePath: string;
    projectPath: string;
    assetBasePath: string;
    forceSyncAsset: string;
    forceSyncAssetTypes: string[];
    assets: (SyncAssetData | string)[];
}
