import { SyncDataBase } from '../data-base';

export abstract class SyncComponentData extends SyncDataBase {
    abstract __type__: string;
}
