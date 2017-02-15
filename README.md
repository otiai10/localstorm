chomex
========

[![Latest Stable Version](https://img.shields.io/npm/v/chomex.svg)](https://www.npmjs.com/package/chomex)
[![Build Status](https://travis-ci.org/otiai10/chomex.svg?branch=master)](https://travis-ci.org/otiai10/chomex) [![Dependency Status](https://gemnasium.com/badges/github.com/otiai10/chomex.svg)](https://gemnasium.com/github.com/otiai10/chomex)
[![NPM Downloads](https://img.shields.io/npm/dt/chomex.svg)](https://www.npmjs.com/package/chomex)

Chrome Extension Messaging Routing Kit.

# Why?

_NEVER_

```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch(message.action) {
  case "/users/get":
    GetUser.apply(sender, [message, sendResponse]);
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

# Features

- **Router**
  - can dispatch messages to specific controllers
- **Client**
  - can send messages to `background.js` and handle response as `Promise` object
- **Model**
  - is simple accessor for `localStorage` like ActiveRecord
    - You ain't gonna need it ;)

# Messaging Example

`background.js` as a server

```javascript
import {Router} from 'chomex';
import {UserController} from './your/controllers';

let router = new Router();
router.on("/users/get", UserController.Get);

// it dispatches messages to registered controllers.
chrome.runtime.onMessage.addListener(router.listener());
```

`content_script.js` as a client

```javascript
import {Client} from 'chomex';

const client = new Client(chrome.runtime);

// it sends message to "/users/get" route.
client.message('/users/get', {id: 1234})
// and can receive response as a Promise!
.then(res => console.log("User:", res.user));
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

# Models Example

I hope you ain't gonna need it

```javascript
// You can create models like ActiveRecord.
class User extends chomex.Model {}

export function GetUserController(message) {
  let user = User.find(message.id);
  if (!user) {
    return {
      status: 404,
      message: `No user with ID: ${message.id}`
    };
  }
  return {status: 200, user};
};
```

# Projects

projects who use `chomex`

- [otiai10/kanColleWidget: MessageRoutes.js](https://github.com/otiai10/kanColleWidget/blob/develop/src/js/Components/Routes/MessageRoutes.js)
