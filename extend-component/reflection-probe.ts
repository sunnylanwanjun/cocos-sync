import { Component, TextureCube, Vec3, _decorator } from 'cc';

const { ccclass, type } = _decorator;

@ccclass('sync.ReflectionProbe')
export class ReflectionProbe extends Component {
    @type(TextureCube)
    texture: TextureCube | undefined;
}
