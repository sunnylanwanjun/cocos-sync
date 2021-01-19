import { AnimationClip, js, _decorator } from "cc";
import { SyncComponentData, SyncComponent, register } from "./component";
import * as SyncAssets from '../asset';
import { AnimatorComponent } from '../extend-component/animator';

export interface SyncAnimatorData extends SyncComponentData {
    clips: string[];
}

@register
export class SyncAnimator extends SyncComponent {
    static comp = AnimatorComponent;

    static import(comp: AnimatorComponent, data: SyncAnimatorData) {
        data.clips.forEach(uuid => {
            let clip = SyncAssets.get(uuid) as AnimationClip;
            if (clip) {
                comp.clips.push(clip);
            }
        })
    }
}
