/**
 * Router should match given message to defined controller.
 * @constructor
 * @param {function} [resolveFunc] used as parser for message to match with controllers.
 */
export class Router {

    constructor(resolveFunc = null) {
        this.resolveFunc = resolveFunc;
        this.routes = {};
    }

    /**
     * `on` can register ControllerFunc to specified route name.
     * @param {string} name routing name for given ControllerFunc
     * @param {function} controllerFunc exacutable function when specified route is matched
    */
    on(name, controllerFunc) {
        this.routes = this.routes || {};
        this.routes[name] = controllerFunc;
    }
    /**
     * `listener` provides listener function which can satisfy Chrome EventListener Func.
     * @return {function} EventListenerFunction
     * @see https://developer.chrome.com/extensions/runtime#event-onMessage
     */
    listener() {
        return this.listen.bind(this);
    }

    // +++++ PRIVATE +++++

    /**
     * `listen` is an entry point for each `onMessage` invocation.
     * @private
     * parameters below are defined by `chorme` EventListener interface.
     * @param {any} message
     * @param {any} sender
     * @param {function} sendResponse
     *
     * TODO: some chrome interface can receive more than 1 arguments,
     * TODO: e.g. https://developer.chrome.com/apps/notifications#event-onButtonClicked
     * TODO: to handle this varieties of EventListener interfaces,
     * TODO: it should handle `arguments` and see if the last arg is Func.
     */
    listen(message, sender, sendResponse = () => {}) {
        try {
            // Find matched controller.
            const controllerFunc = this.match(message, sender);

            // Return `Not Found` if no controller matched.
            if (!controllerFunc) {
                // Not Found.
                return true;
            }

            // TODO: Logger should be global for this module.
            // this.logger.info(this.constructor.name, handlerFunc.name);

            // Let controller create `response`.
            // TODO: some chrome interface can receive more than 1 arguments,
            // TODO: e.g. https://developer.chrome.com/apps/notifications#event-onButtonClicked
            const response = controllerFunc.call({message, sender}, message, sender);

            // `response` can be Promise, but if it's not, just send it as a respone.
            if (!(response instanceof Promise)) {
                sendResponse(this._formatResponse(response));
                return true;
            }

            // If `response` is a Promise object, handle that promise for client.
            response.then(res => {
                sendResponse(this._formatResponse(res));
            }).catch(res => {
                sendResponse(this._formatResponse(res));
            });
            return true;

        } catch (err) {

            // If there is any error while executing, return 500.
            sendResponse(this._formatResponse({
                status: 500, message: err
            }));

            return true;
        }
    }

    /**
     * `match` resolves message to routing name, and return registered controller.
     * @private
     * @param {any} message
     * @param {any} sender
     * @return {function} Matched Controller
     */
    match(message, sender) {
        const {name /* ,params */} = this._resolveRoute(message, sender);
        let controllerFunc = this.routes[name];
        if (!controllerFunc) controllerFunc = this.constructor._NotFoundController;
        return controllerFunc;
    }

    /**
     * @private
     * `_resolveRoute` resolve given message to routing name if matched.
     * It prefers "resolveFunc" if it is given in constructor.
     * @param {any} message
     * @param {any} sender
     * @return {string} Matched Routing Name
     */
    _resolveRoute(message, sender) {
        if (typeof this.resolveFunc == 'function') {
            return this.resolveFunc(message, sender);
        }
        return this._defaultResolveFunc(message, sender);
    }

    /**
     * @private
     * `_defaultResolveFunc` is a default resolve func,
     * which simply resolves routing name with priorities bellow
     * 1. just use message itself, if the message is `string`
     * 2. just use message.act or message.action, if the message is object.
     * @param {any} message
     * @return {string} Routing Name
     */
    _defaultResolveFunc(message) {
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

    /**
     * `_formatResponse` regulates response format.
     * @private
     * @param {any} response
     */
    _formatResponse(response) {
        if (response && Number.isInteger(response.status)) {
            return response;
        }
        return {status: 200, data: (response.data || response)};
    }

    /**
     * `_NotFoundController` is a default controller for unmatched routing.
     * @private
     * @static
     */
    static _NotFoundController(message) {
        return {
            status: 404,
            message: `routing not found for "${message.action || message.act}"`,
        };
    }
}
