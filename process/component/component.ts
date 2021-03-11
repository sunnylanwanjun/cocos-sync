import { Component, js } from "cc";
import { SyncBase } from '../sync-base';

export interface SyncComponentData {
    uuid: string;
    name: string;
}

export class SyncComponent extends SyncBase {
    static comp: typeof Component | string = Component;

    static import (comp: Component, data: SyncComponentData) {
    }
}

// export let classes: Map<string, typeof SyncComponent> = new Map();
// export function register (cls: typeof SyncComponent) {
//     let className = cls.comp;
//     if (typeof className !== 'string') {
//         className = js.getClassName(cls.comp);
//     }
//     classes.set(className, cls);
// }
