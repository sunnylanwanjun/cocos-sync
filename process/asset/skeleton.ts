import { Mat4, Skeleton } from 'cc';
import { SyncSceneData } from '../../scene';
import { AssetOpration } from '../../utils/asset-operation';
import { path, projectAssetPath } from '../../utils/editor';
import { formatPath } from '../../utils/path';
import { register, SyncAsset, SyncAssetData } from './asset';



export interface SyncSkeletonData extends SyncAssetData {
    bones: string[];
    bindposes: string[];
}

@register
export class SyncSkeleton extends SyncAsset {
    static clsName = 'cc.Skeleton';

    static calcPath (data: SyncSkeletonData, sceneData: SyncSceneData) {
        data.srcPath = data.srcPath || path.join(sceneData.assetBasePath, data.path);
        data.dstPath = path.join(projectAssetPath, sceneData.exportBasePath, data.path);

        let basenameNoExt = path.basename(data.dstPath).replace(path.extname(data.dstPath), '');
        data.dstPath = path.join(path.dirname(data.dstPath), basenameNoExt + '.skeleton');
        data.dstUrl = `db://assets/${formatPath(path.relative(projectAssetPath, data.dstPath))}`;
    }

    static async sync (data: SyncSkeletonData) {
        let skeleton = new Skeleton;

        data.bindposes.forEach(mat => {
            let mats = mat.split(',').map(m => parseFloat(m));
            skeleton.bindposes.push(Mat4.fromArray(new Mat4, mats));
        })
        data.bones.forEach(bone => {
            skeleton.joints.push(bone);
        })

        // this.save(data, skeleton);

        await AssetOpration.saveSkeleton(data.dstUrl, skeleton);
    }
}