import { Component, TextureCube, _decorator, __private } from 'cc';

const { ccclass, type, property } = _decorator;

@ccclass('sync.SkyLight')
export class SkyLight extends Component {
    @type(TextureCube)
    mipmaps: TextureCube[] = [];

    @property
    averageBrightness = 0.5;

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
