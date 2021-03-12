import { SyncMeshData, SyncMeshDataDetail } from '../../datas/asset/mesh';
import { SyncSceneData } from '../../datas/scene';
import { Editor, fse, path, projectAssetPath } from '../../utils/editor';
import { toGltfMesh } from '../../utils/gltf';
import { formatPath } from '../../utils/path';
import { register } from '../register';
import { SyncAsset } from './asset';

@register
export class SyncMesh extends SyncAsset {
    DATA = SyncMeshData;

    calcPath (data: SyncMeshData, sceneData: SyncSceneData) {
        data.srcPath = data.srcPath || path.join(sceneData.assetBasePath, data.path);
        data.dstPath = path.join(projectAssetPath, sceneData.exportBasePath, data.path);

        let basenameNoExt = path.basename(data.dstPath).replace(path.extname(data.dstPath), '');
        data.dstPath = path.join(path.dirname(data.dstPath), basenameNoExt, data.meshName + '.gltf');
        data.dstUrl = `db://assets/${formatPath(path.relative(projectAssetPath, data.dstPath))}/${data.meshName}.mesh`;
    }

    async import (data: SyncMeshData) {
        data.detail = await CocosSync.getDetailData(data) as SyncMeshDataDetail;

        let gltf = toGltfMesh(data);

        fse.ensureDirSync(path.dirname(data.dstPath));
        fse.writeJSONSync(data.dstPath, gltf);

        await Editor.Message.request('asset-db', 'refresh-asset', data.dstUrl);
    }
}
