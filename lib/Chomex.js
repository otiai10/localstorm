var Chomex = {};

class Controller {
  ok(response) {
    return Promise.resolve({
      status: 200, data: response
    });
  }
  ng(message, status = 400) {
    return Promise.reject({
      status: 400, message: message
    })
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
    } else if (typeof(matcher.match) == 'function') {
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
    if (Number.isInteger(response.status) && response.data) {
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
