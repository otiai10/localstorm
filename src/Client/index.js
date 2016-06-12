export default class Client {
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
