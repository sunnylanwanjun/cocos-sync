import { Asset } from 'cc';

export abstract class SyncAssetData implements ISyncAssetData {
    abstract __type__ = '';
    __uuid__ = '';

    path = '';

    // only in creator
    asset: Asset | undefined | null;

    srcPath = ''; // absolute path
    dstPath = '';
    dstUrl = '';

    shouldCheckSrc = true;
    virtualAsset = false;
};
