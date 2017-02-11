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

Object.defineProperty(window, 'chrome', {value: {
    runtime,
}});
