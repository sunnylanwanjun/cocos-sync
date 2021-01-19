export default class Event {
    _listeners: any[][] = [];
    _onceListeners: any[][] = [];

    public on (cb: Function, target?: Object) {
        let listeners = this._listeners;
        for (let i = 0; i < listeners.length; i++) {
            if (listeners[i][0] === cb && listeners[i][1] === target) {
                return;
            }
        }
        listeners.push([cb, target]);
    }

    public off (cb: Function, target?: Object) {
        let listeners = this._listeners;
        for (let i = 0; i < listeners.length; i++) {
            if (listeners[i][0] === cb) {
                listeners.splice(i, 1);
                return;
            }
        }
    }

    public once (cb: Function, target?: Object) {
        let listeners = this._onceListeners;
        for (let i = 0; i < listeners.length; i++) {
            if (listeners[i][0] === cb && listeners[i][1] === target) {
                return;
            }
        }
        listeners.push([cb, target]);
    }

    public invoke (a1?, a2?, a3?, a4?, a5?, a6?) {
        var args: any[] = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }

        let listeners = this._listeners;
        for (let i = 0; i < listeners.length; i++) {
            let l = listeners[i];
            l[0].apply(l[1], args);
        }

        let onceListeners = this._onceListeners;
        for (let i = 0; i < onceListeners.length; i++) {
            let l = onceListeners[i];
            l[0].apply(l[1], args);
        }
        onceListeners.length = 0;
    }
}