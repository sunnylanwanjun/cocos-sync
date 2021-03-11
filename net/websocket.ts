import { EDITOR } from 'cc/env';
import { SyncAssetData } from '../process/asset/asset';
import { log, ws } from '../utils/editor';


if (EDITOR) {

    function getWsMessage (msg: any) {
        if (msg instanceof Buffer) {
            let str = '';
            let u16 = new Uint16Array(msg.buffer);
            // let startIndex = 4 + 2; // 64 bytes header + 32 bytes for message length
            let startIndex = 0;
            for (let i = startIndex; i < u16.length; i++) {
                str += String.fromCharCode(u16[i]);
            }
            str = str.substr(str.indexOf('{'));
            msg = str;
        }

        try {
            msg = JSON.parse(msg);
        }
        catch (err) {
            console.error(err);
            return;
        }
        return msg;
    }

    function sendWsMessage (msg: object) {
        if (!CocosSync || CocosSync._wsSocket) {
            return;
        }

        let str = JSON.stringify(msg);
        let startIndex = 2; // 32 bytes for message length
        let u16 = new Uint16Array(str.length + startIndex);
        let u32 = new Uint32Array(u16.buffer, 0, 1);
        u32[0] = str.length * 2;

        for (let i = 0; i < str.length; i++) {
            u16[i + startIndex] = str.charCodeAt(i);
        }

        // i
        CocosSync._wsSocket!.send(u16);
    }

    if (!CocosSync._wsApp) {
        CocosSync._wsApp = new ws.Server({
            port: 8878
        })
        CocosSync._wsApp.on('connection', function connection (ws: any) {
            log('CocosSync WebSocket Connected!');

            ws.on('close', function close () {
                log('CocosSync WebSocket disconnected');
            });
            // ws.on('sync-datas', syncDataString);

            ws.on('message', function (msg: any) {
                msg = getWsMessage(msg);

                if (msg.msg === 'sync-datas') {
                    CocosSync.syncSceneData(msg.data);
                }
                // console.log('CocosSync OnMessage : ' + data);
            })

            ws['get-asset-detail'] = function (uuid: string, cb: Function) {
                function callback (msg: any) {
                    msg = getWsMessage(msg);

                    if (msg.msg === 'get-asset-detail') {
                        cb(msg.data.uuid, msg.data.path);
                        CocosSync._wsSocket?.off('message', callback);
                    }
                }

                sendWsMessage({
                    msg: 'get-asset-detail',
                    uuid: uuid
                });
                CocosSync._wsSocket?.on('message', callback);
            }

            CocosSync._wsSocket = ws;
        });
    }
}
