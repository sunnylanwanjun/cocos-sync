import { SyncAssetData } from "./asset";


export class SyncAnimationCurve {
    name = '';
    values: number[] = [];
    path = '';
    key = 0;
}

export class SyncAnimationClipDetail {
    curves: SyncAnimationCurve[] = [];
    keys: (number[])[] = [];
}

export class SyncAnimationClipData extends SyncAssetData {
    __type__ = 'SyncAnimationClip';

    clipName = '';
    isHuman = false;
    sample = 0;
    duration = 0;
    animName = '';
    folderName = '';
    detail: SyncAnimationClipDetail | undefined;
}
