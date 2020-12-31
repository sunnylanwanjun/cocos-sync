import { SyncSceneData } from '../scene';
import { Editor, fse, path, projectAssetPath, Sharp } from "../utils/editor";
import { register, SyncAsset, SyncAssetData } from "./asset";

interface SyncImageData {
    width: number;
    height: number;
    datas: number[];
}

export interface SyncTextureData extends SyncAssetData {
    image: string;
}

@register
export class SyncTexture extends SyncAsset {
    static clsName = 'cc.Texture';

    static calcPath (data: SyncAssetData, sceneData: SyncSceneData) {
        data.srcPath = path.join(sceneData.assetBasePath, data.path);

        let image = (data as SyncTextureData).image;
        if (image) {
            let basenameNoExt = path.basename(data.path).replace(path.extname(data.path), '');
            data.path = path.join(path.dirname(data.path), basenameNoExt + '.png');
        }

        data.dstPath = path.join(projectAssetPath, sceneData.exportBasePath, data.path);
        data.dstUrl = `db://assets/${path.join(sceneData.exportBasePath, data.path)}/texture`;
    }

    static async sync (data: SyncTextureData, assetBasePath: string) {
        fse.ensureDirSync(path.dirname(data.dstPath));
        if (data.image) {
            let image: SyncImageData;
            try {
                image = JSON.parse(data.image) as SyncImageData;
            }
            catch (err) {
                return console.error(err);
            }

            const channels = 3;
            const rgbaPixel = 0x000000;
            const opts = { raw: { width: image.width, height: image.height, channels } };

            let buffer = Buffer.alloc(image.width * image.height * channels, rgbaPixel);
            let datas = image.datas;
            for (let i = 0; i < datas.length; i++) {
                buffer[i] = datas[i] * 255;
            }

            await new Promise((resolve, reject) => {
                Sharp(buffer, opts)
                    .toFile(data.dstPath, (err: any) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(null);
                    })
            })
        }
        else {
            fse.copyFileSync(data.srcPath, data.dstPath);
        }
        await Editor.Message.request('asset-db', 'refresh-asset', data.dstUrl);
    }
}

