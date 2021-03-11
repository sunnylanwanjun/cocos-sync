import { SyncAssetData } from "./asset/asset";
import { SyncNodeData } from "./node";

export class SyncSceneData {
    nodeCount = 0;
    componentCount = 0;
    children: (SyncNodeData | string)[] = [];

    editorView: SyncNodeData | undefined = undefined;

    exportBasePath = '';
    projectPath = '';
    assetBasePath = '';
    forceSyncAsset = '';
    forceSyncAssetTypes: string[] = []
    assets: (SyncAssetData | string)[] = [];
}
