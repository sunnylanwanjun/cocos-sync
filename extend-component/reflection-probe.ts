import { Component, TextureCube, Vec3, _decorator, __private } from 'cc';

const { ccclass, type } = _decorator;

@ccclass('sync.ReflectionProbe')
export class ReflectionProbe extends Component {
    @type(TextureCube)
    mipmaps: TextureCube[] = [];

    private _cube: TextureCube | undefined;
    get cube () {
        if (!this._cube) {
            this._cube = new TextureCube();
            this._cube.mipmaps = this.mipmaps.map(cube => {
                return cube.mipmaps[0];
            })
            this._cube.setMipFilter(TextureCube.Filter.LINEAR);
        }
        return this._cube;
    }

    start () {
    }
}
