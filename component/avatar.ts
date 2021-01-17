import { Vec3, _decorator, Component } from "cc";

const { ccclass, type } = _decorator;

@ccclass('Avatar')
export class Avatar extends Component {
    @type(Vec3)
    test = new Vec3
}