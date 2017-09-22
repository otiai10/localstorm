chomex
========

[![Latest Stable Version](https://img.shields.io/npm/v/chomex.svg)](https://www.npmjs.com/package/chomex)
[![Build Status](https://travis-ci.org/otiai10/chomex.svg?branch=master)](https://travis-ci.org/otiai10/chomex) [![Dependency Status](https://gemnasium.com/badges/github.com/otiai10/chomex.svg)](https://gemnasium.com/github.com/otiai10/chomex)
[![NPM Downloads](https://img.shields.io/npm/dt/chomex.svg)](https://www.npmjs.com/package/chomex)

Chrome Extension Messaging Routing Kit.

- [Router](https://github.com/otiai10/chomex/tree/master/src/Router/README.md) to handle `onMessage` with routes expression
- [Client](https://github.com/otiai10/chomex/tree/master/src/Client/README.md) to Promisify `sendMessage`
- [Model](https://github.com/otiai10/chomex/tree/master/src/Model/README.md) to access to `localStorage` like `ActiveRecord`

# Installation

```sh
npm install chomex
```

# Why?

### `.onMessage` like a server

_NEVER_

```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch(message.action) {
  case "/users/get":
    GetUser.apply(sender, [message, sendResponse]);
    break;
  default:
    NotFound.apply(sender, [message, sendResponse]);
  }
  return true;
});
```

_DO_

```javascript
let router = new chomex.Router();
router.on("/users/get", GetUser);
chrome.runtime.onMessage.addListener(router.listener());
```

_Happy :)_

### `.sendMessage` like a client

_NEVER_

```js
chrome.runtime.sendMessage({action:"/users/get",id:123}, (response) => {
  if (response.status == 200) {
    alert("User: " + response.user.name);
  } else {
    console.log("Error:", response);
  }
});
```

_DO_

```js
const client = new chomex.Client(chrome.runtime);
client.message("/users/get", {id:123}).then(response => {
  alert("User: " + response.data.user.name);
}).catch(err => {
  console.log("Error:", err));
});
```

_Happy :)_

# Examples

`background.js` as a server

```javascript
import {Router, Model} from 'chomex';

// Define your model
class User extends Model {
  static schema = {
    name: Model.Types.string.isRequired,
    age:  Model.Types.number,
  }
}

// Define your routes
let router = new Router();
router.on("/users/create", message => {
  const obj = message.user;
  const user = User.new(obj).save();
  return user;
});
router.on("/users/get", message => {
  const userId = message.id;
  const user = User.find(userId);
  if (!user) {
    return {status:404,error:"not found"};
  }
  // You can also return async Promise
  return Promise.resolve(user);
});

// it dispatches messages to registered controllers.
chrome.runtime.onMessage.addListener(router.listener());
```

`content_script.js` as a client

```javascript
import {Client} from 'chomex';

const client = new Client(chrome.runtime);

// it sends message to "/users/get" route.
client.message('/users/create', {user:{name:'otiai10',age:30}})
.then(res => {
  console.log("Created:", res.data);
});

client.message('/users/get', {id: 12345}).then(res => {
  console.log("Found:", res.data);
}).catch(err => {
  console.log("Error:", err.status);
});
```

You can also customize resolver for routing.

```javascript
// Resolver rule, which resolve given "id" to routing name.
const resolve = (id) => {
  const prefix = id.split(".")[0];
  return {name: prefix};
};

let router = new Router(resolve);
// You see, this controller is invoked when
// a notification with ID "quest.xxxx" is clicked.
router.on('quest', NotificaionOnClickController.Quest);

chrome.notifications.onClicked.addListener(router.listener());
```

# For more information

- [Router](https://github.com/otiai10/chomex/tree/master/src/Router/README.md)
- [Client](https://github.com/otiai10/chomex/tree/master/src/Client/README.md)
- [Model](https://github.com/otiai10/chomex/tree/master/src/Model/README.md)

# Projects

projects who use `chomex`

- [otiai10/kanColleWidget: MessageRoutes.js](https://github.com/otiai10/kanColleWidget/blob/develop/src/js/Components/Routes/MessageRoutes.js)
