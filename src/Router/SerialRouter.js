import {DummyLogger} from '../Logger';

export class SerialRouter {
    constructor(length = 4, resolver = {}) {
        this.routes = [];
        this.poollength = length;
        this.sequencepool = [];
        this.resolver = (() => {
            if (typeof resolver == 'function') return resolver;
            let r = {};
            Object.keys(resolver).map(key => {
                if (typeof resolver[key] == 'function') r[key] = resolver[key];
            });
            return r;
        })();
        for (let i = 0; i < length; i++) { this.sequencepool.push({}); }
    }
    on(matcher, handlerFunc) {
        if (typeof(matcher) == 'function') {
            this.routes.push({matchFunc: matcher, handlerFunc});
            return this;
        }
        if (Array.isArray(matcher) && matcher.length != 0) {
            const funcs = matcher.map((m) => {
                switch (typeof m) {
                case 'boolean': return () => { return m; };
                case 'string':
                    if (typeof this.resolver != 'function') throw 'resolver must be given when you use simple string matcher';
                    return (detail) => m == this.resolver(detail);
                case 'object':
                    return (detail) => {
                        return Object.keys(m).every(key => {
                            if (m[key] instanceof RegExp) return m[key].test(detail[key]);
                            if (typeof m[key] == 'string') {
                                if (typeof this.resolver[key] == 'function') {
                                    return m[key] == this.resolver[key](detail[key], detail);
                                } else {
                                    return m[key] == detail[key];
                                }
                            }
                            return false;
                        });
                    };
                default: return () => false;
                }
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
        // TODO: Logger should be global for this module.
        // this.logger.debug(this.constructor.name, this.sequencepool);
        const handlerFunc = this.match();
        if (handlerFunc) {
            // TODO: Logger should be global for this module.
            // this.logger.info(this.constructor.name, handlerFunc.name);
            handlerFunc.call({sequence: this.sequencepool.slice(0)}, detail);
        }
        return true;
    }
    listener() {
        return this.listen.bind(this);
    }
}
