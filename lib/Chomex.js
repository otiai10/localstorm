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

class MessageRouter {
  consotructor() {
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
    let controller = this.routes[message.action || message.act];
    if (!controller) controller = this.NotFoundController;
    return controller;
  }
}
Chomex.MessageRouter = MessageRouter;

module.exports = Chomex;
