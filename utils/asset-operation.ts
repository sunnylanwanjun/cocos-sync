import { Asset, assetManager } from "cc";
import { EDITOR, Editor } from './editor';

let _loadAssetByUrl: (filePath: string) => Promise<Asset | null> = async (url: string) => { return null };

if (EDITOR && typeof (window as any).BUILDER === 'undefined') {
    _loadAssetByUrl = async function loadAssetByUrl (url: string) {
        let assetUid = await Editor.Message.request('asset-db', 'query-uuid', url);

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                assetManager.loadAny(assetUid, (err: any, asset: Asset) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(asset);
                });
            }, 500);
        })
    }

}

export let loadAssetByUrl = _loadAssetByUrl;
