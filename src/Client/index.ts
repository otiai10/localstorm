/**
 * `Client` makes it easy to send message to background
 * and enable to handle response with Promise.
 * @constructor
 * @param {object} module is expected to be like [chrome.runtime], which has `sendMessage` method.
 * @param {bool} strict specifies the response promise to be with `status: 200`, otherwise rejection of Promise would be thrown.
 * @param {string} method is a method name which should be invoked, belonging to `module`.
 */
export class Client {

    module: any;
    method: string;
    strict: boolean = false;

    constructor(module, strict = true, method = 'sendMessage') {
        this.module = module;
        switch (typeof(method)) {
        case 'string':
            this.method = method;
            this.strict = strict;
            break;
        case 'boolean':
            this.method = 'sendMessage';
            this.strict = Boolean(method);
            break;
        default:
        }

        if (typeof(this.module[this.method]) != 'function') {
            throw `this module doesn't have valid method with name "${this.method}"`;
        }
    }

    /**
     * `connect` provides a client for long-lived connected port client.
     * @see https://developer.chrome.com/extensions/runtime#method-connect
     * @see https://developer.chrome.com/extensions/tabs#method-connect
     * @param {object} module is either `chrome.runtime` or `chrome.tabs`
     * @param {string} id     might be either `extensionId` or `tabId`
     * @param {object} info   might be `connectInfo`
     */
    static connect(module, id = null, info = {}) {
        let port = module.connect(id, info);
        return new this(port, true, 'postMessage');
    }

    /**
     * `message` is a shorthand to send message to (for example) background.
     * @param {string} name might be routing name to match (or to be resolved).
     * @param {object} params might be parameters to pass to controller.
     * @return {Promise} Result Promise
     */
    message<T>(action: string | Object, param?: Object, callback?: (any) => any): Promise<T | any> {
        let args = Array.prototype.slice.call(arguments);
        // If the first argument is string, it might represent "action".
        // Ensure the first argument to be an Object.
        if (typeof args[0] == 'string') {
            if (typeof args[1] == 'object') {
                args[1].action = args[0];
                args = args.slice(1);
            } else {
                args[0] = {action:args[0]};
            }
        }
        return new Promise<T>((resolve, reject) => {
            this.module[this.method].call(
                this.module,
                ...this._expandArgumentsForChromeMethod(args, resolve, reject)
            );
        });
    }

    /**
     * `_expandArgumentsForChromeMethod` expands given arguments to `message` method,
     * so that the original method of (for example) `chrome.runtime.sendMessage`
     * can handle that arguments.
     * @param {array} args arguments give to `message` method.
     * @param {function} resolve to resolve Response Promise.
     * @param {function} reject to reject Response Promise.
     */
    _expandArgumentsForChromeMethod(args, resolve, reject) {

        const strict = this._isStrictMode(args);

        // If the last argument of `message` is function, respect it and invoke.
        if (typeof args[args.length - 1] == 'function') {
            // Replace the last argument as Callback for chrome interface.
            const cb = args[args.length - 1];
            args[args.length - 1] = (responseFromBackend) => {
                cb(responseFromBackend);
                resolve(); // resolve anyway
                return true;
            };
        } else {
            // Append callback to satisfy chrome interface.
            const _cb = (responseFromBackend) => {
                this._finally(strict, responseFromBackend, resolve, reject);
                return true;
            };
            args.push(_cb);
        }
        return args;
    }

    /**
     * `_isStrictMode`
     * @private
     * @param {array} givenArgs
     * @return {bool}
     */
    _isStrictMode(givenArgs) {
        if (typeof(givenArgs[givenArgs.length - 1]) == 'boolean') {
            return givenArgs[givenArgs.length - 1];
        }
        return this.strict;
    }

    /**
     * `_finally` just dispatch resolve / reject conditions.
     */
    _finally(strict, response, resolve, reject) {
        const status = parseInt(response.status);
        if (strict && (status < 200 || 400 <= status)) {
            reject(response);
        } else {
            resolve(response);
        }
    }

    /**
     * tab
     */
    tab(tabId, strict = true, method = 'sendMessage') {
        return new TargetedClient(tabId, this.module, strict, method);
    }
    /**
     * @static for
     * This is just a shorthand of `(new Client(chrome.tabs)).tab(123) // == TargetedClient`
     * This is kind of insignificant and useless method.
     * Just want to chain constructor and `tab`,
     * like this `Client.for(chrome.tabs, 123).message()`
     */
    static for(module, id, strict = true, method = 'sendMessage') {
        return new TargetedClient(id, module, strict, method);
    }

}

/**
 * TargetedClient converts given arguments to arguments for chrome.tabs.sendMessage
 * because it requires `tabId` for the first argument.
 */
class TargetedClient extends Client {

    tabId: any;

    constructor(tabId, module, strict = true, method = 'sendMessage') {
        super(module, strict, method);
        this.tabId = tabId;
    }
    /**
     * @override
     */
    _expandArgumentsForChromeMethod(args, resolve, reject) {
        args.unshift(this.tabId);
        return super._expandArgumentsForChromeMethod(args, resolve, reject);
    }
}
