import { SyncDataBase } from '../datas/data-base';

export function register (dataClass: SyncDataBase, syncClass: ISyncBase) {
    CocosSync.register(dataClass, syncClass);
}
