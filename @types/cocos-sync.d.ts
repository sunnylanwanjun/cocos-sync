/// <reference path="../datas/@types/data.d.ts">/>

interface ISyncBase {
}


interface ISocket {
    'get-asset-detail' (uuid: string, cb: Function): any;
}

interface IIOSocket extends ISocket {
    on (name: string, cb: Function): void;
    once (name: string, cb: Function): void;
    emit (name: string, ...datas: any[]): void;
}

interface IWSSocket extends ISocket {
    send (data: Uint16Array): void;
    on (name: string, cb: Function): void;
    off (name: string, cb: Function): void;
}

interface IEvent {
    on (cb: Function, target?: Object): void;
    off (cb: Function, target?: Object): void;
    once (cb: Function, target?: Object): void;
    invoke (a1?: any, a2?: any, a3?: any, a4?: any, a5?: any, a6?: any): void;
}

interface ICocosSync {
    getDetailData (asset: any): Promise<object | null>;
    syncSceneData (data: any): Promise<void>;
    syncDataFile (dataPath: string): Promise<void>;

    Export_Base: string,

    FinishedEvent: IEvent,

    // socket io
    _ioApp: any;
    _ioSocket: IIOSocket | undefined;

    // websocket
    _wsApp: any;
    _wsSocket: IWSSocket | undefined;

    // register
    _registedClasses: Map<string, ISyncBase>;
    register (dataName: string, syncClass: ISyncBase): void;
    get (uuid: string): object | undefined;
}

declare const CocosSync: ICocosSync;
