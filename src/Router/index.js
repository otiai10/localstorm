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
      }))
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
    const {name, params} = this.resolveRoute(message, sender);
    let handlerFunc = this.routes[name];
    if (!handlerFunc) handlerFunc = this.NotFoundController;
    return handlerFunc;
  }
}

export class SerialRouter {
  constructor(length = 4, logger = (new DummyLogger())) {
    this.routes = [];
    this.poollength = length;
    this.sequencepool = [];
    this.logger = logger;
    for (let i = 0; i < length; i++) { this.sequencepool.push({}); }
  }
  on(matcher, handlerFunc) {
    if (typeof(matcher) == 'function') {
      this.routes.push({matchFunc: matcher, handlerFunc});
      return this;
    }
    if (Array.isArray(matcher) && matcher.length != 0) {
      const funcs = matcher.map((m) => {
        if (typeof m == 'boolean') return () => { return m };
        if (typeof m == 'object') return function(detail) {
          return Object.keys(m).every(key => {
            if (m[key] instanceof RegExp) return m[key].test(detail[key]);
            return false;
          });
        }
        return () => { return false };
      });
      const matchFunc = (sequence) => {
        return funcs.every((fn, i) => {
          return fn(sequence[i]);
        })
      };
      this.routes.push({matchFunc, handlerFunc});
    }
    return this;
  }
  match() {
    for (let i = 0; i < this.routes.length; i++) {
      if (this.routes[i].matchFunc.call(this, this.sequencepool.slice(0))) {
        return this.routes[i].handlerFunc;
      }
    }
  }
  listen(detail) {
    this.sequencepool.unshift(detail);
    this.sequencepool = this.sequencepool.slice(0, this.poollength);
    this.logger.debug(this.constructor.name, this.sequencepool);
    const handlerFunc = this.match();
    if (handlerFunc) {
      this.logger.info(this.constructor.name, handlerFunc.name);
      handlerFunc.call({sequence: this.sequencepool.slice(0)}, detail);
    }
    return true;
  }
  listener() {
    return this.listen.bind(this);
  }
}
