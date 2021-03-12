
interface ISyncDataBase {
  __type__: string;
}
interface IUUIDBase {
  __uuid__: string;
}

interface ISyncAssetData extends ISyncDataBase {
  __type__: string;
  __uuid__: string;
}

interface ISyncSceneData extends ISyncDataBase {
  exportBasePath: string;
  projectPath: string;
  assetBasePath: string;
  forceSyncAsset: string;
  forceSyncAssetTypes: string[]
}


interface IVec3 {
  x: number;
  y: number;
  z: number;
}

interface IVec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}


interface IQuat extends IVec4 {
}

interface IMat4 {
  m00: number;
  m01: number;
  m02: number;
  m03: number;
  m04: number;
  m05: number;
  m06: number;
  m07: number;
  m08: number;
  m09: number;
  m10: number;
  m11: number;
  m12: number;
  m13: number;
  m14: number;
  m15: number;
}
