/**
 * TODO: write something ;)
 */
export class SerialRouter {
    // TODO: some properties and methods can be private...
    public routes: any[];
    public poollength: number;
    public sequencepool: any[];
    public resolver: any;

    /**
     * @param {number} length
     * @param {Object|function} resolver
     */
    constructor(length = 4, resolver = {}) {
      this.routes = [];
      this.poollength = length;
      this.sequencepool = [];
      this.resolver = (() => {
        if (typeof resolver === 'function') {
          return resolver;
        }
        const r = {};
        Object.keys(resolver).map((key) => {
          if (typeof resolver[key] === 'function') {
            r[key] = resolver[key];
          }
        });
        return r;
      })();
      for (let i = 0; i < length; i++) {
        this.sequencepool.push({});
      }
    }

    /**
     * @param {string|function} matcher
     * @param {function} handlerFunc
     * @return {SerialRouter}
     */
    public on(matcher, handlerFunc) {
      if (typeof(matcher) === 'function') {
        this.routes.push({matchFunc: matcher, handlerFunc});
        return this;
      }
      if (Array.isArray(matcher) && matcher.length !== 0) {
        const funcs: (any) = matcher.map((m) => {
          switch (typeof m) {
            case 'boolean': return () => m;
            case 'string':
              if (typeof this.resolver !== 'function') {
                /* eslint max-len: 0 */
                throw new Error('resolver must be given when you use simple string matcher');
              }
              return (detail) => m === this.resolver(detail);
            case 'object':
              return (detail) => {
                return Object.keys(m).every((key) => {
                  if (m[key] instanceof RegExp) {
                    return m[key].test(detail[key]);
                  }
                  if (typeof m[key] === 'string') {
                    if (typeof this.resolver[key] === 'function') {
                      return m[key] === this.resolver[key](detail[key], detail);
                    } else {
                      return m[key] === detail[key];
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

    /**
     * @return {function}
     */
    public match() {
      for (const route of this.routes) {
        if (route.matchFunc.call(this, this.sequencepool.slice(0))) {
          return route.handlerFunc;
        }
      }
    }

    /**
     * @param {any} detail
     * @return {boolean}
     */
    public listen(detail) {
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

    /**
     * @return {function}
     */
    public listener() {
      return this.listen.bind(this);
    }
}
