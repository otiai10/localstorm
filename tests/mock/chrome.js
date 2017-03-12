let runtime = {
    onMessage: {
        addListener: (listenerFunc) => {
            runtime.onMessage.listenerFunc = listenerFunc;
        }
    },
    sendMessage: (message, sendResponse) => {
        runtime.onMessage.listenerFunc(message, this, (response) => {
            sendResponse(response);
        });
    }
};

let tabs = {
    onMessage: {
        addListener: (listenerFunc) => {
            tabs.onMessage.listenerFunc = listenerFunc;
        }
    },
    sendMessage: (tabId, message, sendResponse) => {
        // In real chrome module, it's gonna be dispatched by tabId.
        // To simulate that, instead of dispatching by tabId,
        // it just embeds `tab` object as given.
        message.tab = {id: tabId};
        tabs.onMessage.listenerFunc(message, this, (response) => {
            sendResponse(response);
        });
    }
};

Object.defineProperty(global, 'chrome', {value: {
    runtime,
    tabs,
}});
