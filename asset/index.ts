import { Asset, error, log } from "cc";
import { SyncSceneData } from "../scene";
import { classes, SyncAssetData } from "./asset";

import './material';
import './mesh';
import './shader';

let map: Map<string, SyncAssetData> = new Map;

export function clear () {
    map.clear();
}

export function get (uuid: string): Asset | null {
    let data = map.get(uuid);
    if (!data) {
        return null;
    }
    return data.asset;
}

export async function sync (data: SyncAssetData, sceneData: SyncSceneData) {
    let cls = classes.get(data.name);
    if (cls) {
        cls.calcPath(data, sceneData);

        let needSync = await cls.needSync(data) || sceneData.forceSyncAsset;
        if (needSync) {
            try {
                log(`Syncing asset : ${data.path}`);
                await cls.sync(data, sceneData.assetBasePath);
            }
            catch (err) {
                error(err);
            }
        }


        try {
            await cls.load(data);
        }
        catch (err) {
            error(err);
        }
    }

    map.set(data.uuid, data);
}

