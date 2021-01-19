import { Skeleton, SkinnedMeshRenderer } from "cc";
import * as SyncAssets from '../asset';
import { register } from "./component";
import { SyncMeshRenderer, SyncMeshRendererData } from "./mesh-renderer";

export interface SyncSkinnedMeshRendererData extends SyncMeshRendererData {
    skeleton: string
}

@register
export class SyncSkinnedMeshRenderer extends SyncMeshRenderer {
    static comp = SkinnedMeshRenderer;

    static import(comp: SkinnedMeshRenderer, data: SyncSkinnedMeshRendererData) {
        super.import(comp, data);

        comp.skeleton = SyncAssets.get(data.skeleton) as Skeleton;
    }
}
