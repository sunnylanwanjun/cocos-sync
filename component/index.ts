
import { error, Node, warn } from 'cc';
import { CocosSync } from '../cocos-sync';
import { SyncComponentData, classes } from './component';


export function sync (data: SyncComponentData, node: Node) {
    let comp = node.getComponent(data.name);
    if (!comp) {
        try {
            comp = node.addComponent(data.name);
        }
        catch (err) {
            error(err);
        }
        if (!comp) {
            warn(`CocosSync: failed to add component ${data.name}.`);
            return;
        }
    }

    let cls = classes.get(data.name);
    if (cls) {
        cls.import(comp, data);
        if ((cls as any).postImport) {
            CocosSync.FinishedEvent.on(() => {
                (cls as any).postImport(comp, data);
            })
        }
    }
}
