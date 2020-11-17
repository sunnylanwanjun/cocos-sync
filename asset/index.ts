import { Asset, error } from "cc";
import { fse, path, projectAssetPath } from "../utils/editor";
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

export async function sync (data: SyncAssetData, assetBasePath: string) {
    let cls = classes.get(data.name);
    if (cls) {
        cls.calcPath(data, assetBasePath);

        let needSync = await cls.needSync(data);
        if (needSync) {
            try {
                await cls.sync(data, assetBasePath);
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

