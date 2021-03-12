import { Asset } from 'cc';
import { SyncDataBase } from '../data-base';

export abstract class SyncAssetData extends SyncDataBase {
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
