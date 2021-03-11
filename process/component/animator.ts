import { AnimationClip, js, SkeletalAnimation, _decorator } from "cc";
import { SyncComponent } from "./component";
import { register } from '../register';
import { SyncAnimatorData } from "../../datas/component/animator";

// export interface SyncAnimatorData extends SyncComponentData {
//     clips: string[];
//     avatarMap: string[];
// }

@register
export class SyncAnimator extends SyncComponent {
    static DATA = SyncAnimatorData;

    static import (comp: SkeletalAnimation, data: SyncAnimatorData) {
        comp.clips.length = 0;
        comp.useBakedAnimation = false;
        data.clips.forEach(uuid => {
            let clip = CocosSync.get(uuid) as AnimationClip;
            if (clip) {
                comp.clips.push(clip);
            }
        })
        if (comp.clips.length > 0) {
            comp.defaultClip = comp.clips[0];
        }
        comp.playOnLoad = true;

        // avatar
        /*
        let avatar = comp.getComponent(js.getClassName(Avatar)) as Avatar;
        if (!avatar) {
            avatar = comp.addComponent(Avatar)!;
        }
        avatar.avatarMap.length = 0;
        avatar.avatarMap = data.avatarMap;
        */
    }
}
