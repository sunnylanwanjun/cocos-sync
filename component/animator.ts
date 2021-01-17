import { AnimationClip, Component, JsonAsset, Material, Mesh, MeshRenderer, Texture2D, Vec4, _decorator } from "cc";
import { SyncComponentData, SyncComponent, register } from "./component";
import * as SyncAssets from '../asset';

const { ccclass, type } = _decorator;

export interface SyncAnimatorData extends SyncComponentData {
    clips: string[];
}

@register
export class SyncAnimator extends SyncComponent {
    static clsName = 'SyncAnimatorComponent';

    static import(comp: SyncAnimatorComponent, data: SyncAnimatorData) {
        data.clips.forEach(uuid => {
            let clip = SyncAssets.get(uuid) as AnimationClip;
            if (clip) {
                comp.clips.push(clip);
            }
        })
    }
}

@ccclass('SyncAnimatorComponent')
export class SyncAnimatorComponent extends Component {
    @type(AnimationClip)
    clips: AnimationClip[] = [];

}