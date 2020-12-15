import { CCObject, getPhaseID, InstancedBuffer, log, Mat4, Material, Mesh, Vec3, _decorator } from "cc";
const { ccclass, property, type, executeInEditMode } = _decorator

import { SyncComponentData, SyncComponent, register } from "./component";

export interface SyncInstanceObjectData extends SyncComponentData {
    mergeSize: number;
}

@register
export class SyncInstanceObject extends SyncComponent {
    static clsName = 'InstanceObject';

    static import (comp, data: SyncInstanceObjectData) {
        comp.clear();
        comp.mergeSize = data.mergeSize;
    }
}
