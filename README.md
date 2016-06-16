chomex [![Build Status](https://travis-ci.org/otiai10/chomex.svg?branch=master)](https://travis-ci.org/otiai10/chomex)
========

Chrome Extension Minimum Routing Kit.

It's used in these projects

- [github.com/otiai10/kcwidget](https://github.com/otiai10/kcwidget/blob/develop/src/js/background.js)

Example
=========

`background.js`

```javascript
// in background.js, like a server
import { Router } from 'chomex';

let router = new Router();

router.on('/hello', (message) => {
  return {data: message.name};
});
router.on('/foo', (message) => {
  return Promise.resolve('This is foo.');
});

// This is what you're used to on developing Chrome Extension.
chrome.runtime.onMessage.addListener(router.listener());
```

`content_script.js`

```javascript
// content_script.js
// just like a client
import { Client } from 'chomex';

const client = new Client(chrome.runtime);

client.message({action: '/hello', name: 'otiai10'}).then((res) => {
  console.log(res);
});
// OUTPUT:
// {status:200, data: 'hello, otiai10!'}


client.message({action: '/foo'}).then((res) => {
  console.log(res);
});
// OUTPUT:
// {status:200, data: 'This is foo.'}
```
