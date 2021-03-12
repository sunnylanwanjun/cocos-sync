import { SyncAssetData } from './asset';

export enum ImageDataFormat {
    RGBA,
    RGBE,
}

export enum TextureType {
    Texture,
    Cube,
}

export class SyncTextureMipmapDetail {
    width = 0;
    height = 0;
    datas: number[] = [];
    dataPath = '';
}

export class SyncTextureDataDetail {
    format = ImageDataFormat.RGBA;
    mipmaps: SyncTextureMipmapDetail[] = [];
}

export class SyncTextureData extends SyncAssetData {
    __type__ = 'cc.Texture'

    type = TextureType.Texture;
    mipmapCount = 1;
    detail: SyncTextureDataDetail | undefined;
}
