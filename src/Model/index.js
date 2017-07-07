import Types from './Types';

import OnMemoryStorage from './OnMemoryStorage';

export class Model {

    static Types = Types

    /**
     * @interface storage
     * @method getItem(key: string): Object?
     * @method setItem(key: string, value: Object?)
     * @method removeItem(key: string)
     */

    /**
     * @default __storage = a wrapper of global.localStorage, with handling Object
     */
    static __storage = global.localStorage ? new (function() {
        this.store = global.localStorage;
        this.setItem    = function(key, val) { this.store.setItem(key, JSON.stringify(val)); };
        this.getItem    = function(key) { return JSON.parse(this.store.getItem(key) || 'null'); };
        this.removeItem = function(key) { this.store.removeItem(key); };
    }) : new OnMemoryStorage();

    static useStorage(storage = {}) {
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

    constructor(props = {}, id, ns) {
        const template = Object.assign({}, this.constructor.template);
        Object.keys(template).map(key => {
            if (typeof props[key] != 'undefined') return;
            props[key] = (typeof template[key] == 'function') ? template[key]() : template[key];
        });
        this._props = props;
        this._id = id;
        this._ns = ns || this.constructor.name;
        this.decode(props);
    }
    static new(props = {}) {
        return new this(props);
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
        Object.keys(all).map(_id => {
            let _this = new this(all[_id], _id, this.name);
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
    static create(dict = (this.template || {})) {
        if (typeof dict != 'object') return;
        let all = this._all();
        const _id = dict._id || this.__nextID(all);
        let model = new this(dict, _id);
        return model.save();
    }
    static find(id) {
        const all = this._all();
        const _id = String(id);
        if (all[_id]) {
            let _this = new this(all[_id], _id, this.name);
            return _this.decode(all[_id]);
        } else if (this.default && this.default[_id]) {
            let _this = new this(this.default[_id], _id, this.name);
            return _this.decode(this.default[_id]);
        }
    }
    static filter(fn = () => true) {
        const all = this.all();
        let _res = [];
        Object.keys(all).map(_id => {
            if (fn(all[_id])) _res.push(all[_id]);
        });
        return _res;
    }
    save() {
        let all = this.constructor._all();
        if (!this._id) this._id = this.constructor.__nextID(all);
        this._validate(); // TODO: should be response object??
        all[this._id] = this.encode();
        this.constructor.__storage.setItem(this.constructor.name, all);
        return this;
    }
    delete() {
        let all = this.constructor._all();
        if (!this._id) return false;
        if (delete all[this._id] === false) return false;
        this.constructor.__storage.setItem(this.constructor.name, all);
        return true;
    }
    update(dict) {
        if (typeof dict != 'object') return this.error('Argument for `update` must be key-value dictionary');
        dict = this._fixture(dict);
        // TODO: filter preserved keywords
        Object.keys(dict).map(key => this[key] = dict[key]);
        return !!this.save();
    }
    error(err) {
        this.errors = this.errors || [];
        this.errors.push(err);
        return false;
    }
    decode(obj) {
        Object.keys(obj).map(key => {
            this[key] = obj[key];
        });
        return this;
    }
    encode() {
        let encoded = {};
        for (let prop in this) {
            if (['_id', '_ns', '_props'].some(x => { return x == prop; })) continue;
            if (this.hasOwnProperty(prop)) encoded[prop] = this[prop];
        }
        return encoded;
    }
    _validate() {
        if (!this.constructor.schema) return null;
        Object.keys(this.constructor.schema).map(propName => {
            this.constructor.schema[propName](this[propName], propName);
        });
    }

    /**
     * fixes next properties with template
     * prefer properties this already has and next properties given.
     */
    _fixture(props, template = Object.assign({}, this.constructor.template || {})) {
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
    static nextID(/* all */) {
        return this.timestampID(); // for default
    }
    static timestampID() {
        return String(Date.now());
    }
    static sequentialID(all) {
        return (Object.keys(all)
          .map(id => parseInt(id))
          .sort((prev, next) => (prev < next) ? -1 : 1)
          .pop() || 0) + 1;
    }
}
