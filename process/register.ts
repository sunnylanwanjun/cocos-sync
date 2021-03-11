import { error } from '../utils/editor';
import { SyncBase } from './sync-base';

export function register (syncClass: typeof SyncBase) {
    if (!syncClass) {
        error('register syncClass failed : should pass a SyncBase.')
        return;
    }
    let name = '';
    if(syncClass.DATA && typeof syncClass.DATA !== 'string') {
        name = new syncClass.DATA().name;
    }
    else {
        name = syncClass.DATA;
    }

    if (!name) {
        error('register syncClass failed : should declare the data name.')
        return;
    }

    CocosSync.register(name, syncClass);
}
