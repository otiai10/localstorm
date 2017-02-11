import {DummyLogger} from '../Logger';

export class SerialRouter {
    constructor(length = 4, logger = (new DummyLogger())) {
        this.routes = [];
        this.poollength = length;
        this.sequencepool = [];
        this.logger = logger;
        for (let i = 0; i < length; i++) { this.sequencepool.push({}); }
    }
    on(matcher, handlerFunc) {
        if (typeof(matcher) == 'function') {
            this.routes.push({matchFunc: matcher, handlerFunc});
            return this;
        }
        if (Array.isArray(matcher) && matcher.length != 0) {
            const funcs = matcher.map((m) => {
                if (typeof m == 'boolean') return () => { return m; };
                if (typeof m == 'object') return function(detail) {
                    return Object.keys(m).every(key => {
                        if (m[key] instanceof RegExp) return m[key].test(detail[key]);
                        return false;
                    });
                };
                return () => { return false; };
            });
            const matchFunc = (sequence) => {
                return funcs.every((fn, i) => {
                    return fn(sequence[i]);
                });
            };
            this.routes.push({matchFunc, handlerFunc});
        }
        return this;
    }
    match() {
        for (let i = 0; i < this.routes.length; i++) {
            if (this.routes[i].matchFunc.call(this, this.sequencepool.slice(0))) {
                return this.routes[i].handlerFunc;
            }
        }
    }
    listen(detail) {
        this.sequencepool.unshift(detail);
        this.sequencepool = this.sequencepool.slice(0, this.poollength);
        this.logger.debug(this.constructor.name, this.sequencepool);
        const handlerFunc = this.match();
        if (handlerFunc) {
            this.logger.info(this.constructor.name, handlerFunc.name);
            handlerFunc.call({sequence: this.sequencepool.slice(0)}, detail);
        }
        return true;
    }
    listener() {
        return this.listen.bind(this);
    }
}
