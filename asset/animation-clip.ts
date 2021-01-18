import { animation, AnimationClip, error, IVec3Like } from 'cc';
import { relative } from 'path';
import { CocosSync } from '../cocos-sync';
import { SyncSceneData } from '../scene';
import { deserializeData } from '../utils/deserialize';
import { Editor, fse, path, projectAssetPath } from '../utils/editor';
import { toGltfMesh } from '../utils/gltf';
import { formatPath } from '../utils/path';
import { register, SyncAsset, SyncAssetData } from './asset';

export interface SyncAnimationCurve {
    name: string;
    times: number[];
    keyframes: number[];
}

export interface SyncAnimationNode {
    curves: (SyncAnimationCurve | string)[]
}

export interface SyncAnimationClipDetail {
    nodes: (SyncAnimationNode | string)[]
}

export interface SyncAnimationClipData extends SyncAssetData {
    clipName: string;
    isHuman: boolean;
    sample: number;
    duration: number;

    detail: SyncAnimationClipDetail;
}


@register
export class SyncAnimationClip extends SyncAsset {
    static clsName = 'SyncAnimationClip';

    static calcPath(data: SyncAnimationClipData, sceneData: SyncSceneData) {
        data.srcPath = path.join(sceneData.assetBasePath, data.path);
        data.dstPath = path.join(projectAssetPath, sceneData.exportBasePath, data.path);

        let basenameNoExt = path.basename(data.dstPath).replace(path.extname(data.dstPath), '');
        data.dstPath = path.join(path.dirname(data.dstPath), basenameNoExt + '.anim');
        data.dstUrl = `db://assets/${formatPath(path.relative(projectAssetPath, data.dstPath))}`;
    }

    static async sync(data: SyncAnimationClipData) {
        let detail = data.detail = await CocosSync.getDetailData(data) as SyncAnimationClipDetail;

        if (data.isHuman) {
            var clip = new AnimationClip(data.clipName);
            clip.sample = data.sample;
            clip.duration = clip.duration;

            let curves: AnimationClip.ICurve[] = clip.curves;

            let nodeData = deserializeData(detail.nodes[0]);
            nodeData.curves.forEach(curveData => {
                let curve = deserializeData(curveData);

                if (!clip.keys.length) {
                    clip.keys.push(curve.times);
                }

                curves.push({
                    modifiers: [
                        new animation.ComponentPath('Avatar'),
                        curve.name,
                    ],
                    data: {
                        keys: 0,
                        values: curve.keyframes,
                    },
                })
            })

            await this.save(data, clip);
        }
    }
}
