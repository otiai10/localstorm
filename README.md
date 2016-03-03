Chomex
========

Chrome Extension Minimum Routing Kit

Example
=========

in background

```javascript
import {MessageRouter, Controller} from 'chomex';

var router = new MessageRouter();
router.on('/hello', new Controller());

// This is what we are used to.
chrome.runtime.onMessage.addListener(router.listener());
```

in content_script

```javascript
chrome.runtime.sendMessage(null, {act: '/hello', name: 'otiai10'}, (res) => {
  console.log(res);
});
// OUTPUT:
// {status:200, data: 'hello, otiai10!'}
```
