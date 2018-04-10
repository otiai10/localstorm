# chomex.Client

Never

```js
chrome.runtime.sendMessage({action:"/echo",greet:"Hello!"}, (res) => {
  if (res.ok) {
    // do something
  } else {
    // do error handling
  }
})
```

Do

```js
const client = new Client(chrome.runtime);

// You can get and handle as a Promise
client.message("/echo", {greet:"Hello!"}).then(res => {
  // do something
}).catch(err => {
  // do error handling
})
```

# for `chrome.runtime`

```js
const client = new Client(chrome.runtime);
client.message("/config/put", {mute:true});
// Of course it depends on Router you defined ;)
```

# for `chrome.tabs`

```js
const client = new Client(chrome.tabs);
client.tab(tabId).message("/mute/changed", {muted:true});

// Or you can use shorthand like this
Client.for(chrome.tabs, tabId).message("/mute/changed", {muted:true});
```
