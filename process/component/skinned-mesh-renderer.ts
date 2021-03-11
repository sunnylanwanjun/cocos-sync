import { find, Skeleton, SkinnedMeshRenderer } from "cc";
import { SyncSkinnedMeshRendererData } from "../../datas/component/skinned-mesh-renderer";
import { register } from "../register";
import { SyncMeshRenderer } from "./mesh-renderer";

@register
export class SyncSkinnedMeshRenderer extends SyncMeshRenderer {
    static DATA = SyncSkinnedMeshRendererData;

    static import(comp: SkinnedMeshRenderer, data: SyncSkinnedMeshRendererData) {
        super.import(comp, data);

        comp.skeleton = CocosSync.get(data.skeleton) as Skeleton;
    }

    static postImport(comp: SkinnedMeshRenderer, data: SyncSkinnedMeshRendererData) {

        let rootBone = find(CocosSync.Export_Base + '/' + data.rootBonePath);
        if (rootBone) {
            comp.skinningRoot = rootBone;
        }

        comp.skinningRoot = rootBone;

        super.postImport(comp, data);
    }
}
