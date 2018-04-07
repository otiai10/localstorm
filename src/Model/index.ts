import Types from './Types';

declare module global {
    var localStorage: {
        getItem: () => any;
        setItem: () => any;
    }
    class Storage {
        getItem: () => any;
        setItem: () => any;
    }
}

import OnMemoryStorage from './OnMemoryStorage';

export default class Model {

    static Types = Types

    _props: any;
    _id: string;
    _ns: string;

    static default?: any;
    static template?: any;

    errors: any[];

    /**
     * @interface storage
     * @method getItem(key: string): Object?
     * @method setItem(key: string, value: Object?)
     * @method removeItem(key: string)
     */

    /**
     * @default __storage = a wrapper of global.localStorage, with handling Object
     */
    static __storage = global.localStorage ? Model.implementNativeStorage(global.localStorage) : new OnMemoryStorage();

    /**
     * implementNativeStorage
     * Implements chomex.Storage interface from localStorage/sessionStorage.
     * @param nativeStorage: Object which has window.Storage interface.
     * @return storage: class Object which has chomex.Storage interface.
     */
    static implementNativeStorage(nativeStorage) {
        return new (function() {
            this.store = nativeStorage;
            this.setItem    = function(key, val) { this.store.setItem(key, JSON.stringify(val)); };
            this.getItem    = function(key) { return JSON.parse(this.store.getItem(key) || 'null'); };
            this.removeItem = function(key) { this.store.removeItem(key); };
        });
    }

    static useStorage(storage: any = {}) {

        if (global.Storage && storage instanceof global.Storage) {
            storage = this.implementNativeStorage(storage);
        }

        if (typeof storage.getItem !== 'function') {
            throw '`getItem` of Storage interface is missing';
        }
        if (typeof storage.setItem !== 'function') {
            throw '`setItem` of Storage interface is missing';
        }
        if (typeof storage.removeItem !== 'function') {
            throw 'it doesn\'t satisfy expected Storage interface';
        }
        if (storage.getItem.length < 1) {
            throw '`getItem` of Storage must accept at least 1 argument';
        }
        if (storage.setItem.length < 2) {
            throw '`setItem` of Storage must accept at least 2 argument';
        }
        if (storage.removeItem.length < 1) {
            throw '`removeItem` of Storage must accept at least 1 argument';
        }
        this.__storage = storage;
    }

    constructor(props = {}, id?: string, ns?: string) {
        const constructor: any = this.constructor;
        const template = Object.assign({}, constructor.template);
        Object.keys(template).map(key => {
            if (typeof props[key] != 'undefined') return;
            props[key] = (typeof template[key] == 'function') ? template[key]() : template[key];
        });
        this._props = props;
        this._id = id;
        this._ns = ns || this.constructor.name;
        this.decode(props);
    }
    static new<T extends Model>(props = {}): T {
        const copy: any = new this(props);
        return copy as T;
    }

    /**
     * it returns all saved entities **as Objects**
     */
    static _all() {
        const _ns = this.name;
        const all = this.__storage.getItem(_ns);
        return all || this.default || {};
    }
    /**
     * it returs all saved entities **as Models**
     */
    static all() {
        let all = this._all();
        const self = this;
        Object.keys(all).map(_id => {
            let _this = new self(all[_id], _id, self.name);
            all[_id] = _this.decode(all[_id]);
        });
        return all;
    }

    /**
     * list is an alias of `Model.filter(() => true);`
     * @return {array} of model instances
     */
    static list() {
        return this.filter();
    }

    static drop() {
        this.__storage.removeItem(this.name);
    }
    static create<T extends Model>(dict = (this.template || {})): T {
        if (typeof dict != 'object') return;
        let all = this._all();
        const _id = dict._id || this.__nextID(all);
        let model = new this(dict, _id);
        return model.save<T>();
    }
    static find<T extends Model>(id): T {
        const all = this._all();
        const _id = String(id);
        if (all[_id]) {
            let _this = new this(all[_id], _id, this.name);
            return _this.decode<T>(all[_id]);
        } else if (this.default && this.default[_id]) {
            let _this = new this(this.default[_id], _id, this.name);
            return _this.decode<T>(this.default[_id]);
        }
    }
    static filter(fn = (any) => true) {
        const all = this.all();
        let _res = [];
        Object.keys(all).map(_id => {
            if (fn(all[_id])) _res.push(all[_id]);
        });
        return _res;
    }
    save<T extends Model>(): T {
        const constructor: any = this.constructor;
        let all = constructor._all();
        if (!this._id) this._id = constructor.__nextID(all);
        this._validate(); // TODO: should be response object??
        all[this._id] = this.encode();
        constructor.__storage.setItem(constructor.name, all);
        const copy: any = this;
        return copy as T;
    }
    delete() {
        // FIXME
        const constructor: any = this.constructor;
        let all = constructor._all();
        if (!this._id) return false;
        if (delete all[this._id] === false) return false;
        constructor.__storage.setItem(this.constructor.name, all);
        return true;
    }
    update(dict) {
        if (typeof dict != 'object') return this.error('Argument for `update` must be key-value dictionary');
        dict = this._fixture(dict);
        // TODO: filter preserved keywords
        Object.keys(dict).map(key => this[key] = dict[key]);
        return this.save();
    }
    error(err) {
        this.errors = this.errors || [];
        this.errors.push(err);
        return false;
    }
    decode<T extends Model>(obj): T {
        Object.keys(obj).map(key => {
            this[key] = obj[key];
        });
        const copy: any = this;
        return <T> copy;
    }
    encode() {
        let encoded: any = {};
        for (let prop in this) {
            if (['_id', '_ns', '_props'].some(x => { return x == prop; })) continue;
            if (this.hasOwnProperty(prop)) encoded[prop] = this[prop];
        }
        return encoded;
    }
    _validate() {
        const constructor: any = this.constructor;
        if (!constructor.schema) return null;
        Object.keys(constructor.schema).map(propName => {
            constructor.schema[propName](this[propName], propName);
        });
    }

    /**
     * fixes next properties with template
     * prefer properties this already has and next properties given.
     */
    _fixture(props, template?) {
        if (typeof template == 'undefined') {
            const constructor: any = this.constructor;
            template = Object.assign({}, constructor.template);
        }
        Object.keys(template).map(key => {
            if (typeof this[key]  != 'undefined') return;
            if (typeof props[key] != 'undefined') return;
            props[key] = (typeof template[key] == 'function') ? template[key]() : template[key];
        });
        return props;
    }

    static __nextID(all) {
        if (typeof this.nextID === 'function') {
            const id = this.nextID(all);
            if (id === undefined || id === null) {
                console.error('customized `nextID` function provides invalid ID');
                return this.timestampID;
            }
            return id;
        }
        return this.timestampID();
    }
    static nextID(all?) {
        return this.timestampID(); // for default
    }
    static timestampID() {
        return Date.now();
    }
    static sequentialID(all) {
        return (Object.keys(all)
            .map(id => parseInt(id))
            .sort((prev, next) => (prev < next) ? -1 : 1)
            .pop() || 0) + 1;
    }
}
