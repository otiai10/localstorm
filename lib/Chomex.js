/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _Model = __webpack_require__(1);

	var _Model2 = _interopRequireDefault(_Model);

	var _Client = __webpack_require__(2);

	var _Client2 = _interopRequireDefault(_Client);

	var _Router = __webpack_require__(3);

	var _Router2 = _interopRequireDefault(_Router);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var chomex = {
	  Model: _Model2.default,
	  Client: _Client2.default,
	  Router: _Router2.default
	};

	exports.default = chomex;

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// class Storage {
	//   static __driver;
	//   static use(istorage = (window || {}).localStorage) {
	//     // TODO: validate
	//     Storage.__driver = istorage;
	//   }
	//   static getItem(key) {
	//     let res = Storage.__driver.getItem(key);
	//     if (res instanceof Promise) return res;
	//     return Promise.resolve(res);
	//   }
	//   static setItem(key, value) {
	//     Storage.__driver.setItem(key, value);
	//     return Promise.resolve({key, value});
	//   }
	// }
	// Storage.use();

	var Model = function () {
	  function Model(props, id, ns) {
	    _classCallCheck(this, Model);

	    this._props = props || {};
	    this._id = id;
	    this._ns = ns || this.constructor.name;
	    this.decode(props);
	  }

	  _createClass(Model, [{
	    key: "save",
	    value: function save() {
	      var all = this.constructor.all();
	      if (!this._id) this._id = this.constructor.nextID(all);
	      all[this._id] = this.encode();
	      localStorage.setItem(this.constructor.name, JSON.stringify(all));
	      return this;
	    }
	  }, {
	    key: "error",
	    value: function error(err) {
	      this.errors = this.errors || [];
	      this.errors.push(err);
	    }
	  }, {
	    key: "decode",
	    value: function decode(obj) {
	      var _this2 = this;

	      Object.keys(obj).map(function (key) {
	        _this2[key] = obj[key];
	      });
	      return this;
	    }
	  }, {
	    key: "encode",
	    value: function encode() {
	      var _this3 = this;

	      var encoded = {};

	      var _loop = function _loop(prop) {
	        if (["_id", "_ns", "_props"].some(function (x) {
	          return x == prop;
	        })) return "continue";
	        if (_this3.hasOwnProperty(prop)) encoded[prop] = _this3[prop];
	      };

	      for (var prop in this) {
	        var _ret = _loop(prop);

	        if (_ret === "continue") continue;
	      }
	      return encoded;
	    }
	  }], [{
	    key: "all",
	    value: function all() {
	      var _ns = this.name;
	      var raw = localStorage.getItem(_ns);
	      var all = JSON.parse(raw);
	      return all || {};
	    }
	  }, {
	    key: "find",
	    value: function find(id) {
	      var all = this.all();
	      var _id = String(id);
	      if (all[_id]) {
	        var _this = new this(all[_id], _id, this.name);
	        return _this.decode(all[_id]);
	      } else if (this.default && this.default[_id]) {
	        var _this4 = new this(this.default[_id], _id, this.name);
	        return _this4.decode(this.default[_id]);
	      }
	    }
	  }, {
	    key: "where",
	    value: function where() {
	      var fltr = arguments.length <= 0 || arguments[0] === undefined ? function () {
	        return false;
	      } : arguments[0];

	      var all = this.all();
	      var _res = [];
	      Object.keys(all).map(function (_id) {
	        if (fltr(all[_id])) _res.push(all[_id]);
	      });
	      return _res;
	    }
	  }, {
	    key: "nextID",
	    value: function nextID(all) {
	      return String(Date.now());
	    }
	  }]);

	  return Model;
	}();

	exports.default = Model;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Client = function () {
	  function Client(module) {
	    var method = arguments.length <= 1 || arguments[1] === undefined ? 'sendMessage' : arguments[1];
	    var strict = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

	    _classCallCheck(this, Client);

	    this.module = module;

	    switch (typeof method === 'undefined' ? 'undefined' : _typeof(method)) {
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

	    if (typeof this.module[this.method] != 'function') {
	      throw 'this module doesn\'t have valid method with name "' + this.method + '"';
	    }
	  }

	  _createClass(Client, [{
	    key: 'args',
	    value: function args(_args, resolve, reject) {

	      var strict = function (_default) {
	        if (typeof _args[_args.length - 1] == 'boolean') {
	          return _args.pop();
	        } else {
	          return _default;
	        }
	      }(this.strict);

	      var anyway = function anyway(response, _res, _rej) {
	        var status = parseInt(response.status);
	        if (status < 200 || 400 <= status) {
	          if (strict) {
	            _rej(response);
	          }
	        } else {
	          _res(response);
	        }
	      };

	      var promisefy = function promisefy() {
	        var result = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	        if (result instanceof Promise) {
	          result.then(function (response) {
	            anyway(response, resolve, reject);
	          }).catch(function (err) {
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

	      if (typeof _args[_args.length - 1] == 'function') {
	        (function () {
	          // Replace the last argument for `addListener`
	          var cb = _args[_args.length - 1];
	          _args[_args.length - 1] = function (responseFromBackend) {
	            return promisefy(cb(responseFromBackend));
	          };
	        })();
	      } else {
	        // Append the last argument which is wrapped by promise.
	        _args.push(function (responseFromBackend) {
	          promisefy(responseFromBackend);
	        });
	      }
	      return _args;
	    }
	  }, {
	    key: 'message',
	    value: function message() {
	      var _this = this;

	      var args = new (Function.prototype.bind.apply(Array, [null].concat(Array.prototype.slice.call(arguments))))();
	      return new Promise(function (resolve, reject) {
	        var _module$method;

	        (_module$method = _this.module[_this.method]).call.apply(_module$method, [_this].concat(_toConsumableArray(_this.args(args, resolve, reject))));
	      });
	    }
	  }]);

	  return Client;
	}();

	exports.default = Client;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Router = function () {
	  function Router() {
	    _classCallCheck(this, Router);

	    this.routes = {};
	  }

	  _createClass(Router, [{
	    key: 'keyFromMessage',
	    value: function keyFromMessage(message) {
	      if (typeof message == 'string') return { key: message, params: {} };
	      if (typeof message.act == 'string') return { key: message.act, params: {} };
	      if (typeof message.action == 'string') return { key: message.action, params: {} };
	      return { key: '__notfound', params: {} };
	    }
	  }, {
	    key: 'on',
	    value: function on(action, handlerFunc) {
	      this.routes = this.routes || {};
	      this.routes[action] = handlerFunc;
	    }
	  }, {
	    key: 'formatResponse',
	    value: function formatResponse(response) {
	      if (response && Number.isInteger(response.status)) {
	        return response;
	      }
	      return { status: 200, data: response.data || response };
	    }
	  }, {
	    key: 'listen',
	    value: function listen(message, sender, sendResponse) {
	      var _this = this;

	      try {
	        var response = this.match(message, sender).call({ message: message, sender: sender }, message, sender);
	        if (response instanceof Promise) {
	          response.then(function (res) {
	            sendResponse(_this.formatResponse(res));
	          }).catch(function (res) {
	            sendResponse(_this.formatResponse(res));
	          });
	        } else {
	          sendResponse(this.formatResponse(response));
	        }
	        return true;
	      } catch (err) {
	        sendResponse(this.formatResponse({
	          status: 500, message: err
	        }));
	        return true;
	      }
	    }
	  }, {
	    key: 'listener',
	    value: function listener() {
	      return this.listen.bind(this);
	    }
	  }, {
	    key: 'NotFoundController',
	    value: function NotFoundController() {
	      return {
	        status: 404,
	        message: 'routing not found for ' + (this.message.action || this.message.act)
	      };
	    }
	  }, {
	    key: 'match',
	    value: function match(message, sender) {
	      var handlerFunc = this.routes[this.keyFromMessage(message).key];
	      if (!handlerFunc) handlerFunc = this.NotFoundController;
	      return handlerFunc;
	    }
	  }]);

	  return Router;
	}();

	exports.default = Router;

/***/ }
/******/ ]);