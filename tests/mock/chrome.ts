interface Channel {
    onMessage: {
        addListener: ((any) => any);
        listenerFunc?: (...any) => any;
    };
    sendMessage: (...any) => any;
}

const runtime: Channel = {
  onMessage: {
    addListener: (listenerFunc) => {
      runtime.onMessage.listenerFunc = listenerFunc;
    },
  },
  sendMessage: (message, sendResponse) => {
    if (message.action === '/empty') {
      sendResponse();
    }
    /* eslint no-invalid-this: 0 */
    runtime.onMessage.listenerFunc(message, this, (response) => {
      sendResponse(response);
    });
  },
};

const tabs: Channel = {
  onMessage: {
    addListener: (listenerFunc) => {
      tabs.onMessage.listenerFunc = listenerFunc;
    },
  },
  sendMessage: (tabId, message, sendResponse) => {
    // In real chrome module, it's gonna be dispatched by tabId.
    // To simulate that, instead of dispatching by tabId,
    // it just embeds `tab` object as given.
    message.tab = {id: tabId};
    tabs.onMessage.listenerFunc(message, this, (response) => {
      sendResponse(response);
    });
  },
};

declare let global: any;
Object.defineProperty(global, 'chrome', {value: {
  runtime,
  tabs,
}});
