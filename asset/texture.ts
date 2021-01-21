import { type } from 'os';
import { CocosSync } from '../cocos-sync';
import { SyncSceneData } from '../scene';
import { AssetOpration } from '../utils/asset-operation';
import { deserializeData } from '../utils/deserialize';
import { Editor, fse, path, projectAssetPath, Sharp } from "../utils/editor";
import { register, SyncAsset, SyncAssetData } from "./asset";

enum ImageDataFormat {
    RGBA,
    RGBE,
}

enum TextureType {
    Texture,
    Cube,
}

interface SyncTextureMipmapDetail {
    width: number;
    height: number;
    datas: number[];
}

interface SyncTextureDataDetail {
    format: ImageDataFormat;
    mipmaps: SyncTextureMipmapDetail[];
}

export interface SyncTextureData extends SyncAssetData {
    type: TextureType;
    mipmapCount: number;
    detail: SyncTextureDataDetail;
}

@register
export class SyncTexture extends SyncAsset {
    static clsName = 'cc.Texture';

    static calcPath(data: SyncTextureData, sceneData: SyncSceneData) {
        data.srcPath = path.join(sceneData.assetBasePath, data.path);

        if (!this.supportFormat(data.srcPath)) {
            let basenameNoExt = path.basename(data.path).replace(path.extname(data.path), '');
            data.path = path.join(path.dirname(data.path), basenameNoExt + '.png');
        }

        data.dstPath = path.join(projectAssetPath, sceneData.exportBasePath, data.path);

        let subfix = 'texture';
        if (data.type === TextureType.Cube) {
            subfix = 'textureCube';
        }
        data.dstUrl = `db://assets/${path.join(sceneData.exportBasePath, data.path)}/${subfix}`;
    }

    static supportFormat(path: string) {
        return path.endsWith('.png') || path.endsWith('.tga');
    }

    static async sync(data: SyncTextureData, assetBasePath: string) {
        if (!this.supportFormat(data.srcPath)) {
            data.detail = await CocosSync.getDetailData(data) as SyncTextureDataDetail;
        }

        let detail = data.detail;
        if (detail) {
            await Promise.all(detail.mipmaps.map(async (mipmapData, index) => {
                mipmapData = deserializeData<SyncTextureMipmapDetail>(mipmapData);

                const channels = 4;
                const rgbaPixel = 0x00000000;
                const opts = { raw: { width: mipmapData.width, height: mipmapData.height, channels } };

                let buffer = Buffer.alloc(mipmapData.width * mipmapData.height * channels, rgbaPixel);
                let datas = mipmapData.datas;
                for (let i = 0; i < datas.length; i++) {
                    buffer[i] = datas[i];
                }

                let subfix = `/mipmap_${index}.png`;
                let dstPath = data.dstPath;
                let dstUrl = data.dstUrl;
                if (detail.mipmaps.length > 1) {
                    dstPath += subfix;
                    dstUrl = dstUrl.replace('/textureCube', subfix + '/textureCube');
                }

                fse.ensureDirSync(path.dirname(dstPath));

                await new Promise((resolve, reject) => {
                    Sharp(buffer, opts)
                        .toFile(dstPath, (err: any) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve(null);
                        })
                })

                await Editor.Message.request('asset-db', 'refresh-asset', dstUrl);

                if (data.type === TextureType.Cube) {
                    let metaPath = dstPath + '.meta';
                    if (fse.existsSync(metaPath)) {
                        let meta = fse.readJSONSync(metaPath);
                        meta.userData.type = 'texture cube';
                        fse.writeJSONSync(metaPath, meta);

                        await Editor.Message.request('asset-db', 'refresh-asset', dstUrl);
                    }
                }
            }));
        }
        else {
            fse.copyFileSync(data.srcPath, data.dstPath);
        }
    }

    static async load(data: SyncTextureData) {
        if (data.mipmapCount > 1) {
            data.asset = await Promise.all(new Array(data.mipmapCount).fill(0).map(async (mipmapData, index) => {
                let subfix = `/mipmap_${index}.png`;
                let dstUrl = data.dstUrl.replace('/textureCube', subfix + '/textureCube');
                return await AssetOpration.loadAssetByUrl(dstUrl)
            })) as any;
        }
        else {
            data.asset = await AssetOpration.loadAssetByUrl(data.dstUrl);
        }
    }
}

