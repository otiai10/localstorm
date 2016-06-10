var Chomex = {};

class WebRequestRouter {
  constructor(length = 4) {
    this.routes = [];
    this.poollength = length;
    this.sequencepool = [];
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
    const handlerFunc = this.match();
    if (handlerFunc) handlerFunc.call({sequence: this.sequencepool.slice(0)}, detail);
    return true;
  }
  listener() {
    return this.listen.bind(this);
  }
}
Chomex.WebRequestRouter = WebRequestRouter;

class Router {
  constructor() {
    this.routes = {};
  }
  keyFromMessage(message) {
    if (typeof(message) == 'string') return {key:message,params:{}};
    if (typeof(message.act) == 'string') return {key:message.act,params:{}};
    if (typeof(message.action) == 'string') return {key:message.action,params:{}};
    return {key:'__notfound',params:{}};
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
  listen(message, sender, sendResponse) {
    try {
      const response = this.match(message, sender).call({message, sender}, message, sender);
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
    let handlerFunc = this.routes[this.keyFromMessage(message).key];
    if (!handlerFunc) handlerFunc = this.NotFoundController;
    return handlerFunc;
  }
}
Chomex.Router = Router;

class Client {
  constructor(module, method = 'sendMessage', strict = false) {
    this.module = module;

    switch (typeof(method)) {
      case 'string':
        this.method = method;
        this.strict = strict;
        break;
      case 'boolean':
        this.method = 'sendMessage';
        this.strict = method;
        break;
      default:
    }

    if (typeof(this.module[this.method]) != 'function') {
      throw `this module doesn't have valid method with name "${this.method}"`;
    }
  }
  args(args, resolve, reject) {

    const strict = ((_default) => {
      if (typeof(args[args.length - 1]) == 'boolean') {
        return args.pop();
      } else {
        return _default;
      }
    })(this.strict);

    const anyway = (response, _res, _rej) => {
      const status = parseInt(response.status);
      if (status < 200 || 400 <= status) {
        if (strict) {
          _rej(response);
        }
      } else {
        _res(response);
      }
    };

    const promisefy = (result = {}) => {
      if (result instanceof Promise) {
        result.then((response) => {
          anyway(response, resolve, reject);
        }).catch(err => {
          anyway({
            status: 500,
            error: err,
            data: response
          });
        });
      } else {
        anyway(result, resolve, reject);
      }
    };

    if (typeof(args[args.length - 1]) == 'function') {
      // Replace the last argument for `addListener`
      const cb = args[args.length - 1];
      args[args.length - 1] = (responseFromBackend) => {
        return promisefy(cb(responseFromBackend));
      };
    } else {
      // Append the last argument which is wrapped by promise.
      args.push((responseFromBackend) => {
        promisefy(responseFromBackend)
      });
    }
    return args;
  }
  message() {
    let args = new Array(...arguments);
    return new Promise((resolve, reject) => {
      this.module[this.method].call(this, ...this.args(args, resolve, reject));
    })
  }
}
Chomex.Client = Client;

import Model from './Model';
Chomex.Model = Model;

module.exports = Chomex;
