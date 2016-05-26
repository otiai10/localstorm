var Chomex = {};

class Controller {
  ok(response) {
    return Promise.resolve({
      status: 200, data: response
    });
  }
  ng(message, status = 400) {
    return Promise.reject({status, message});
  }
  promise(arg) {
  }
  handle(msg, sender) {
    return this.ok(`hello, ${msg.name}!`);
  }
}
Chomex.Controller = Controller;

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
  constructor(module, method = 'sendMessage') {
    this.module = module;
    if (typeof(this.module[method]) != 'function') {
      throw `this module doesn't have valid method with name "${method}"`;
    }
    this.method = method;
  }
  args(args, resolve) {
    if (typeof(args[args.length - 1]) == 'function') {
      const cb = args[args.length - 1];
      args[args.length - 1] = (response) => {
        const result = cb(response);
        if (result instanceof Promise) {
          return resolve(result);
        } else {
          resolve(result);
        }
      }
    } else {
      args.push((response) => { resolve(response); })
    }
    return args;
  }
  message() {
    let args = new Array(...arguments);
    return new Promise((resolve) => {
      this.module[this.method].call(this, ...this.args(args, resolve));
    })
  }
}
Chomex.Client = Client;

module.exports = Chomex;
