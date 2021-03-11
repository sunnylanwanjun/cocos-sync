import { log } from 'cc';
import { EDITOR } from 'cc/env';
import { io } from '../utils/editor';

if (EDITOR) {
    if (!CocosSync._ioSocket) {
        CocosSync._ioSocket = io('8877')
        CocosSync._ioSocket!.on('connection', (socket: any) => {
            log('CocosSync SocketIO Connected!');

            socket.on('disconnect', () => {
                log('CocosSync SocketIO Disconnected!');
            });

            socket.on('sync-datas-with-file', function (data: any) {
                CocosSync.syncDataFile(data);
            });
            socket.on('sync-datas', function (data: any) {
                CocosSync.syncSceneData(data);
            });

            socket['get-asset-detail'] = function (uuid: string, cb: Function) {
                CocosSync._ioSocket!.emit('get-asset-detail', uuid);
                CocosSync._ioSocket!.once('get-asset-detail', cb);
            }

            CocosSync._ioSocket = socket;
        })
    }
}
