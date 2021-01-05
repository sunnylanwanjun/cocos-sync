import { CocosSync } from '../cocos-sync';
import { SyncSceneData } from '../scene';
import { Editor, fse, path, projectAssetPath, Sharp } from "../utils/editor";
import { register, SyncAsset, SyncAssetData } from "./asset";

interface SyncTextureDataDetail {
    width: number;
    height: number;
    datas: number[];
}

export interface SyncTextureData extends SyncAssetData {
    detail: SyncTextureDataDetail;
}

@register
export class SyncTexture extends SyncAsset {
    static clsName = 'cc.Texture';

    static calcPath (data: SyncAssetData, sceneData: SyncSceneData) {
        data.srcPath = path.join(sceneData.assetBasePath, data.path);

        if (!this.supportFormat(data.srcPath)) {
            let basenameNoExt = path.basename(data.path).replace(path.extname(data.path), '');
            data.path = path.join(path.dirname(data.path), basenameNoExt + '.png');
        }

        data.dstPath = path.join(projectAssetPath, sceneData.exportBasePath, data.path);
        data.dstUrl = `db://assets/${path.join(sceneData.exportBasePath, data.path)}/texture`;
    }

    static supportFormat (path: string) {
        return path.endsWith('.png') || path.endsWith('.tga');
    }

    static async sync (data: SyncTextureData, assetBasePath: string) {
        if (!this.supportFormat(data.srcPath)) {
            data.detail = await CocosSync.getDetailData(data) as SyncTextureDataDetail;
        }

        fse.ensureDirSync(path.dirname(data.dstPath));
        if (data.detail) {
            let detail = data.detail;

            const channels = 4;
            const rgbaPixel = 0x00000000;
            const opts = { raw: { width: detail.width, height: detail.height, channels } };

            let buffer = Buffer.alloc(detail.width * detail.height * channels, rgbaPixel);
            let datas = detail.datas;
            for (let i = 0; i < datas.length; i++) {
                buffer[i] = datas[i];
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

