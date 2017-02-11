import {DummyLogger} from '../Logger';

export class Router {
    constructor(resolveFunc = null, logger = (new DummyLogger())) {
        this.resolveFunc = resolveFunc;
        this.routes = {};
        this.logger = logger;
    }

    resolveRoute(message, sender) {
        if (typeof this.resolveFunc == 'function') {
            return this.resolveFunc(message, sender);
        } else {
            return this._resolveFunc(message, sender);
        }
    }

    _resolveFunc(message) {
        if (typeof(message) == 'string') return {
            name: message, params: {}
        };
        if (typeof(message.act) == 'string') return {
            name: message.act, params: {}
        };
        if (typeof(message.action) == 'string') return {
            name: message.action, params: {}
        };
        return {
            name: '__notfound', params: {}
        };
    }

    on(action, handlerFunc) {
        this.routes = this.routes || {};
        this.routes[action] = handlerFunc;
    }
    formatResponse(response) {
        if (response && Number.isInteger(response.status)) {
            return response;
        }
        return {status: 200, data: (response.data || response)};
    }
    listen(message, sender, sendResponse = () => {}) {
        try {
            const handlerFunc = this.match(message, sender);
            if (!handlerFunc) return false;
            this.logger.info(this.constructor.name, handlerFunc.name);
            const response = handlerFunc.call({message, sender}, message, sender);
            if (response instanceof Promise) {
                response.then(res => {
                    sendResponse(this.formatResponse(res));
                }).catch(res => {
                    sendResponse(this.formatResponse(res));
                });
            } else {
                sendResponse(this.formatResponse(response));
            }
            return true;
        } catch(err) {
            sendResponse(this.formatResponse({
                status: 500, message: err
            }));
            return true;
        }
    }
    listener() {
        return this.listen.bind(this);
    }
    NotFoundController() {
        return {
            status: 404,
            message: `routing not found for ${this.message.action || this.message.act}`
        };
    }
    match(message, sender) {
        const {name /* ,params */} = this.resolveRoute(message, sender);
        let handlerFunc = this.routes[name];
        if (!handlerFunc) handlerFunc = this.NotFoundController;
        return handlerFunc;
    }
}
