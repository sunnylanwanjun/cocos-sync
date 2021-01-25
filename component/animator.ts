import { Animation, AnimationClip, js, _decorator } from "cc";
import { SyncComponentData, SyncComponent, register } from "./component";
import * as SyncAssets from '../asset';
import { AnimatorComponent } from '../extend-component/animator';
import { Avatar } from "../extend-component/avatar";

export interface SyncAnimatorData extends SyncComponentData {
    clips: string[];
    avatarMap: string[];
}

@register
export class SyncAnimator extends SyncComponent {
    static comp = AnimatorComponent;

    static import(comp: AnimatorComponent, data: SyncAnimatorData) {
        // animation
        let animation = comp.getComponent(Animation)!;
        if (!animation) {
            animation = comp.addComponent(Animation)!;
        }
        animation.clips.length = 0;
        data.clips.forEach(uuid => {
            let clip = SyncAssets.get(uuid) as AnimationClip;
            if (clip) {
                animation.clips.push(clip);
            }
        })

        // avatar
        let avatar = comp.getComponent(js.getClassName(Avatar)) as Avatar;
        if (!avatar) {
            avatar = comp.addComponent(Avatar)!;
        }
        avatar.avatarMap.length = 0;
        avatar.avatarMap = data.avatarMap;
    }
}
