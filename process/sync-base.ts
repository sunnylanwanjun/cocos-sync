import { SyncDataBase } from "../datas/data-base";

export class SyncBase {
    static DATA: typeof SyncDataBase | string = SyncDataBase;
    static async sync (data: SyncDataBase, ...args: any[]): Promise<any> {
    }
}
