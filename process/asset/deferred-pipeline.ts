import { Asset } from 'cc';
import { SyncDeferredPipelineData } from '../../datas/asset/deferred-pipeline';
import { SyncMaterialData } from '../../datas/asset/material';
import { Editor, error, fse } from '../../utils/editor';
import { register } from '../register';
import { SyncAsset } from './asset';

@register
export class SyncDeferredPipleline extends SyncAsset {
    DATA = SyncDeferredPipelineData;

    async import (data: SyncDeferredPipelineData) {
        let tempUrl = 'db://internal/default_renderpipeline/builtin-deferred.rpp'
        const tempPath = await Editor.Message.request('asset-db', 'query-path', tempUrl);
        const contentJson = fse.readJsonSync(tempPath);
        if (!Array.isArray(contentJson)) {
            error('builtin-deferred.rpp should be Array');
            return;
        }

        if (data.deferredLightingMaterialUuid) {
            let materialData = await CocosSync.get<SyncMaterialData>(data.deferredLightingMaterialUuid);

            if (materialData && materialData.asset) {
                contentJson.forEach(content => {
                    if (content.__type__ === 'LightingStage') {
                        content._deferredMaterial.__uuid__ = (materialData.asset! as Asset)._uuid;
                    }
                })
            }
        }

        this.save(data, JSON.stringify(contentJson, null, 4));
    }
}
