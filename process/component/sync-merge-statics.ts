import { SyncInstanceObjectData } from "../../datas/component/instance-object";
import { register } from "../register";
import { SyncComponent } from "./component";


@register
export class SyncInstanceObject extends SyncComponent {
    static DATA = SyncInstanceObjectData;

    static import (comp: any, data: SyncInstanceObjectData) {
        comp.clear();
        comp.mergeSize = data.mergeSize;
    }
}
