import { SyncTextureData, SyncTextureDataDetail, TextureType } from '../../datas/asset/texture';
import { SyncSceneData } from '../../datas/scene';
import { AssetOpration } from '../../utils/asset-operation';
import { deserializeData } from '../../utils/deserialize';
import { Editor, fse, log, path, projectAssetPath, Sharp } from "../../utils/editor";
import { relpaceExt } from '../../utils/path';
import { register } from '../register';
import { SyncAsset } from "./asset";


@register
export class SyncTexture extends SyncAsset {
    DATA = SyncTextureData;

    getDstRelPath (data: SyncTextureData) {
        let dstPath = super.getDstRelPath(data);
        if (!this.supportFormat(data.srcPath)) {
            dstPath = relpaceExt(dstPath, '.png')
        }
        return dstPath;
    }

    getDstUrl (data: SyncTextureData) {
        let dstUrl = super.getDstUrl(data);

        let subfix = 'texture';
        if (data.type === TextureType.Cube) {
            subfix = 'textureCube';
        }

        return `${dstUrl}/${subfix}`;
    }

    supportFormat (path: string) {
        return path.endsWith('.png') || path.endsWith('.tga');
    }

    async import (data: SyncTextureData) {
        if (!this.supportFormat(data.srcPath)) {
            data.detail = await CocosSync.getDetailData(data) as SyncTextureDataDetail;
        }

        let mipmapCount = 1;
        if (data.detail && data.detail.mipmaps) {
            mipmapCount = data.detail.mipmaps.length;
        }

        let detail = data.detail;
        if (detail) {
            await Promise.all(detail.mipmaps.map(async (mipmapData, index) => {
                mipmapData = deserializeData(mipmapData);

                let subfix = `/mipmap_${index}.png`;
                let dstPath = data.dstPath;
                let dstUrl = data.dstUrl;
                if (detail!.mipmaps.length > 1) {
                    dstPath += subfix;
                    dstUrl = dstUrl.replace('/textureCube', subfix + '/textureCube');
                }

                fse.ensureDirSync(path.dirname(dstPath));

                if (mipmapData.dataPath) {
                    fse.copyFileSync(mipmapData.dataPath, dstPath);
                }
                else {
                    const channels = 4;
                    const rgbaPixel = 0x00000000;
                    const opts = { raw: { width: mipmapData.width, height: mipmapData.height, channels } };

                    let buffer = Buffer.alloc(mipmapData.width * mipmapData.height * channels, rgbaPixel);
                    let datas = mipmapData.datas;
                    for (let i = 0; i < datas.length; i++) {
                        buffer[i] = datas[i];
                    }

                    await new Promise((resolve, reject) => {
                        Sharp(buffer, opts)
                            .toFile(dstPath, (err: any) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(null);
                            })
                    })
                }

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
                else if (data.type === TextureType.Texture && mipmapCount === 1) {
                    let metaPath = dstPath + '.meta';
                    if (fse.existsSync(metaPath)) {
                        let meta = fse.readJSONSync(metaPath);
                        if (meta.subMetas) {
                            for (let id in meta.subMetas) {
                                meta.subMetas[id].userData.mipfilter = 'linear';
                            }
                        }
                        fse.writeJSONSync(metaPath, meta);

                        await Editor.Message.request('asset-db', 'refresh-asset', dstUrl);
                    }
                }
            }));
        }
        else {
            fse.ensureDirSync(path.dirname(data.dstPath));
            fse.copyFileSync(data.srcPath, data.dstPath);
            await Editor.Message.request('asset-db', 'refresh-asset', data.dstUrl);
        }
    }

    async load (data: SyncTextureData) {
        log('load asset : ' + data.path);

        let mipmapCount = 1;
        if (data.detail && data.detail.mipmaps) {
            mipmapCount = data.detail.mipmaps.length;
        }

        if (mipmapCount > 1) {
            data.asset = await Promise.all(new Array(mipmapCount).fill(0).map(async (mipmapData, index) => {
                let subfix = `/mipmap_${index}.png`;
                let dstUrl = data.dstUrl.replace('/textureCube', subfix + '/textureCube');
                return await AssetOpration.loadAssetByUrl(dstUrl)
            })) as any;
        }
        else {
            data.asset = await AssetOpration.loadAssetByUrl(data.dstUrl) as any;
        }
    }
}

