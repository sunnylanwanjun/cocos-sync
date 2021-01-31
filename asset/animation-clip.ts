import { animation, AnimationClip, error, IVec3Like, Quat, Vec3 } from 'cc';
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
    values: number[];
    path: string;
    key: number;
}

export interface SyncAnimationClipDetail {
    curves: SyncAnimationCurve[];
    keys: (number[])[];
}

export interface SyncAnimationClipData extends SyncAssetData {
    clipName: string;
    isHuman: boolean;
    sample: number;
    duration: number;
    animName: string;

    detail: SyncAnimationClipDetail;
}


@register
export class SyncAnimationClip extends SyncAsset {
    static clsName = 'SyncAnimationClip';

    static calcPath(data: SyncAnimationClipData, sceneData: SyncSceneData) {
        data.srcPath = path.join(sceneData.assetBasePath, data.path);
        data.dstPath = path.join(projectAssetPath, sceneData.exportBasePath, data.path);

        let basenameNoExt = path.basename(data.dstPath).replace(path.extname(data.dstPath), '');
        basenameNoExt += "/" + data.animName;

        data.dstPath = path.join(path.dirname(data.dstPath), basenameNoExt + '.anim');
        data.dstUrl = `db://assets/${formatPath(path.relative(projectAssetPath, data.dstPath))}`;
    }

    static async sync(data: SyncAnimationClipData) {
        let detail = data.detail = await CocosSync.getDetailData(data) as SyncAnimationClipDetail;

        if (data.isHuman) {
            var clip = new AnimationClip();
            clip.sample = data.sample;
            clip.duration = data.duration;
            clip.wrapMode = AnimationClip.WrapMode.Loop;

            let curves: AnimationClip.ICurve[] = clip.curves;

            let curveList = deserializeData(detail.curves);
            clip.keys = deserializeData(detail.keys);

            curveList.forEach(curveData => {
                let curve = deserializeData(curveData);

                let valuesData = curve.values;
                let values = [];
                if (curve.name == 'position' || curve.name == 'scale') {
                    for (let i = 0; i < valuesData.length; i += 3) {
                        values.push(new Vec3(valuesData[i], valuesData[i + 1], valuesData[i + 2]));
                    }
                }
                else if (curve.name == 'rotation') {
                    for (let i = 0; i < valuesData.length; i += 4) {
                        values.push(new Quat(valuesData[i], valuesData[i + 1], valuesData[i + 2], valuesData[i + 3]));
                    }
                }

                curves.push({
                    modifiers: [
                        new animation.HierarchyPath(curve.path),
                        curve.name,
                    ],
                    data: {
                        keys: curve.key,
                        values: values
                    },
                })
            });

            /*
            nodeData.curves.forEach(curveData => {
                let curve = deserializeData(curveData);

                let values = [];
                let keyframes = curve.keyframes;
                if (curve.name.endsWith('.translation') || curve.name.endsWith('.scale')) {
                    for (let i = 0; i < keyframes.length; i += 3) {
                        values.push(new Vec3(keyframes[i], keyframes[i + 1], keyframes[i + 2]));
                    }
                }
                else if (curve.name.endsWith('rotation')) {
                    for (let i = 0; i < keyframes.length; i += 4) {
                        values.push(new Quat(keyframes[i], keyframes[i + 1], keyframes[i + 2], keyframes[i + 3]));
                    }
                }

                if (!clip.keys.length) {
                    clip.keys.push(curve.times);
                }

                curves.push({
                    modifiers: [
                        new animation.ComponentPath('sync.Avatar'),
                        curve.name,
                    ],
                    data: {
                        keys: 0,
                        values: values
                    },
                })
            })*/

            await this.save(data, clip);
        }
    }
}
