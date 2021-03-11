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
    width: number;
    height: number;
    datas: number[];
    dataPath: string;
}

export class SyncTextureDataDetail {
    format: ImageDataFormat;
    mipmaps: SyncTextureMipmapDetail[] = [];
}

export class SyncTextureData extends SyncAssetData {
    name = 'cc.Texture'

    type: TextureType;
    mipmapCount: number;
    detail: SyncTextureDataDetail;

    virtualAsset = false;
}
