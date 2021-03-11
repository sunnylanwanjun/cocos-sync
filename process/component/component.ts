import { Component, js, Node } from "cc";
import { SyncComponentData } from "../../datas/component/component";
import { error, warn } from "../../utils/editor";
import { SyncBase } from '../sync-base';

export class SyncComponent extends SyncBase {
    static async sync (data: SyncComponentData, node: Node) {
        if (!data.__type__) {
            return;
        }

        let comp = node.getComponent(data.__type__);
        if (!comp) {
            try {
                comp = node.addComponent(data.__type__);
            }
            catch (err) {
                error(err);
            }
            if (!comp) {
                warn(`CocosSync: failed to add component ${data.__type__}.`);
                return;
            }
        }

        this.import(comp, data);
        if (this.postImport) {
            CocosSync.FinishedEvent.on(() => {
                this.postImport!(comp, data);
            })
        }
    }

    static import (comp: Component, data: SyncComponentData) {
    }

    static postImport: Function | null = null;
}
