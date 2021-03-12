import { SyncAssetData } from "./asset/asset";
import { SyncDataBase } from './data-base';
import { SyncNodeData } from "./node";

export class SyncSceneData extends SyncDataBase {
    __type__ = 'cc.Scene'

    children: (SyncNodeData | string)[] = [];

    editorView: SyncNodeData | undefined = undefined;

    exportBasePath = '';
    projectPath = '';
    assetBasePath = '';
    forceSyncAsset = '';
    forceSyncAssetTypes: string[] = []
    assets: (SyncAssetData | string)[] = [];
}
