import { find, Skeleton, SkinnedMeshRenderer } from "cc";
import * as SyncAssets from '../asset';
import { register } from "./component";
import { SyncMeshRenderer, SyncMeshRendererData } from "./mesh-renderer";
import { CocosSync } from '../cocos-sync';

export interface SyncSkinnedMeshRendererData extends SyncMeshRendererData {
    skeleton: string
    rootBonePath: string;
}

@register
export class SyncSkinnedMeshRenderer extends SyncMeshRenderer {
    static comp = SkinnedMeshRenderer;

    static import(comp: SkinnedMeshRenderer, data: SyncSkinnedMeshRendererData) {
        super.import(comp, data);

        comp.skeleton = SyncAssets.get(data.skeleton) as Skeleton;
    }

    static postImport(comp: SkinnedMeshRenderer, data: SyncSkinnedMeshRendererData) {
        super.postImport(comp, data);

        let rootBone = find(CocosSync.Export_Base + '/' + data.rootBonePath);
        if (rootBone) {
            comp.skinningRoot = rootBone;
        }
    }
}
