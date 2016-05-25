Chomex
========

Chrome Extension Minimum Routing Kit

Example
=========

`background.js`

```javascript
// background.js
// just like a server
import { MessageRouter } from 'chomex';

var router = new MessageRouter();

// Add some handlerFunc to this router
router.on('/hello', (message, sender) => {
    return {data: message.name};
});

// You can return promise in handlerFunc
router.on('/foo', (message, sender) => {
    const p = new Promise((resolve) => {
      setTimeout(() => resolve('This is foo.'), 3000);
    });
    return p;
});

// This is what you're used to on developing Chrome Extension.
chrome.runtime.onMessage.addListener(router.listener());
```

`content_script.js`

```javascript
// content_script.js
// just like a client
chrome.runtime.sendMessage(null, {action: '/hello', name: 'otiai10'}, (res) => {
  console.log(res);
});
// OUTPUT:
// {status:200, data: 'hello, otiai10!'}


// Async response
chrome.runtime.sendMessage(null, {action: '/foo'}, (res) => {
  console.log(res);
});
// OUTPUT:
// {status:200, data: 'This is foo.'}
```
