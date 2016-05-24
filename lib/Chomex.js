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

class Router {
  constructor(matcher) {
    if (typeof(matcher) == 'function') {
      this.matcher = {match: matcher};
    } else if (matcher && typeof(matcher.match) == 'function') {
      this.matcher = matcher;
    } else {
      this.matcher = {match: this.keyFromMessage};
    }
  }
  keyFromMessage(message) {
    if (typeof(message) == 'string') return {key:message,params:{}};
    if (typeof(message.act) == 'string') return {key:message.act,params:{}};
    if (typeof(message.action) == 'string') return {key:message.action,params:{}};
    return {key:'__notfound',params:{}};
  }
}

class WebRequestRouter extends Router {
  constructor(length = 4) {
    super();
    this.routes = [];
    this.poollength = length;
    this.sequencepool = [];
    for (let i = 0; i < length; i++) { this.sequencepool.push({}); }
  }
  on(matcher, controller) {
    if (typeof(matcher) == 'function') {
      this.routes.push({matchFunc: matcher, controller});
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
      this.routes.push({matchFunc, controller});
    }
    return this;
  }
  match() {
    for (let i = 0; i < this.routes.length; i++) {
      if (this.routes[i].matchFunc.call(this, this.sequencepool.slice(0))) {
        return this.routes[i].controller;
      }
    }
  }
  listen(detail) {
    this.sequencepool.unshift(detail);
    this.sequencepool = this.sequencepool.slice(0, this.poollength);
    const controller = this.match();
    if (controller) controller.call(this, detail, this.sequencepool.slice(0));
    return true;
  }
  listener() {
    return this.listen.bind(this);
  }
}
Chomex.WebRequestRouter = WebRequestRouter;

class MessageRouter extends Router {
  constructor(matcher) {
    super(matcher);
    this.routes = {};
  }
  on(action, controller) {
    this.routes = this.routes || {};
    this.routes[action] = controller;
  }
  formatResponse(response) {
    if (response && Number.isInteger(response.status)) {
      return response;
    }
    return {status: 200, data: response};
  }
  listen(message, sender, sendResponse) {
    let response = this.match(message, sender).handle(message, sender);
    if (response instanceof Promise) {
      response.then(res => {
        sendResponse(this.formatResponse(res));
      }).catch(res => {
        sendResponse(this.formatResponse(res));
      });
      return true;
    }
    sendResponse(this.formatResponse(res));
    return true;
  }
  listener() {
    return this.listen.bind(this);
  }
  get NotFoundController() {
    return new class extends Controller {
      handle(message, sender) {
        return this.ng(`routing not found for ${message.action || message.act}`, 404);
      }
    }
  }
  match(message, sender) {
    let controller = this.routes[this.keyFromMessage(message).key];
    if (!controller) controller = this.NotFoundController;
    return controller;
  }
}
Chomex.MessageRouter = MessageRouter;

module.exports = Chomex;
