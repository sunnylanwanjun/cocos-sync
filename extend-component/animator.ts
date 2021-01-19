import { AnimationClip, Component, _decorator } from 'cc';

const { ccclass, type } = _decorator;

@ccclass('sync.AnimatorComponent')
export class AnimatorComponent extends Component {
    @type(AnimationClip)
    clips: AnimationClip[] = [];
}