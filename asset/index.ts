import { Asset, error, log } from "cc";
import { SyncSceneData } from "../scene";
import { path } from '../utils/editor';
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
        // log(`Time 1: ${Date.now() / 1000}`);

        cls.calcPath(data, sceneData);

        let forceSyncAsset = false;

        let regs = sceneData.forceSyncAsset.split(',');
        regs.forEach(reg => {
            if (!reg) return;
            if (new RegExp(reg).test(data.srcPath.toLowerCase())) {
                forceSyncAsset = true;
            }
        })

        // log(`Time 2: ${Date.now() / 1000}`);

        let needSync = await cls.needSync(data) || forceSyncAsset;
        if (needSync) {
            try {
                log(`Syncing asset : ${data.path}`);
                await cls.sync(data, sceneData.assetBasePath);
            }
            catch (err) {
                error(err);
            }
        }

        // log(`Time 3: ${Date.now() / 1000}`);

        try {
            await cls.load(data);
        }
        catch (err) {
            error(err);
        }

        // log(`Time 4: ${Date.now() / 1000}`);
    }

    map.set(data.uuid, data);
}

