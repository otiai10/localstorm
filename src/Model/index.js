// class Storage {
//   static __driver;
//   static use(istorage = (window || {}).localStorage) {
//     // TODO: validate
//     Storage.__driver = istorage;
//   }
//   static getItem(key) {
//     let res = Storage.__driver.getItem(key);
//     if (res instanceof Promise) return res;
//     return Promise.resolve(res);
//   }
//   static setItem(key, value) {
//     Storage.__driver.setItem(key, value);
//     return Promise.resolve({key, value});
//   }
// }
// Storage.use();

export class Model {
    constructor(props = {}, id, ns) {
        this._props = props || {};
        this._id = id;
        this._ns = ns || this.constructor.name;
        this.decode(props);
    }
    static new() {
        return new this();
    }

  /**
   * it returns all saved entities **as Objects**
   */
    static _all() {
        const _ns = this.name;
        const raw = localStorage.getItem(_ns);
        const all = JSON.parse(raw || 'null');
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

    static drop() {
        localStorage.removeItem(this.name);
    }
    static create(dict) {
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
    static filter(fn = () => { return false; }) {
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
        all[this._id] = this.encode();
        localStorage.setItem(this.constructor.name, JSON.stringify(all));
        return this;
    }
    delete() {
        let all = this.constructor._all();
        if (!this._id) return false;
        if (delete all[this._id] === false) return false;
        localStorage.setItem(this.constructor.name, JSON.stringify(all));
        return true;
    }
    update(dict) {
        if (typeof dict != 'object')
            return this.error('Argument for `update` must be key-value dictionary');
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
          .sort((prev, next) => prev < next)
          .pop() || 0) + 1;
    }
}
