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
  static all() {
    const _ns = this.name;
    const raw = localStorage.getItem(_ns);
    const all = JSON.parse(raw || 'null');
    return all || this.default || {};
  }
  static find(id) {
    const all = this.all();
    const _id = String(id);
    if (all[_id]) {
      let _this = new this(all[_id], _id, this.name);
      return _this.decode(all[_id]);
    } else if (this.default && this.default[_id]) {
      let _this = new this(this.default[_id], _id, this.name);
      return _this.decode(this.default[_id]);
    }
  }
  static where(fltr = () => { return false }) {
    const all = this.all();
    let _res = [];
    Object.keys(all).map(_id => {
      if (fltr(all[_id])) _res.push(all[_id]);
    });
    return _res;
  }
  save() {
    let all = this.constructor.all();
    if (!this._id) this._id = this.constructor.nextID(all);
    all[this._id] = this.encode();
    localStorage.setItem(this.constructor.name, JSON.stringify(all));
    return this;
  }
  delete() {
    let all = this.constructor.all();
    if (!this._id) return false;
    if (delete all[this._id] === false) return false;
    localStorage.setItem(this.constructor.name, JSON.stringify(all));
    return true;
  }
  error(err) {
    this.errors = this.errors || [];
    this.errors.push(err);
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
      if (["_id", "_ns", "_props"].some(x => { return x == prop; })) continue;
      if (this.hasOwnProperty(prop)) encoded[prop] = this[prop];
    }
    return encoded;
  }

  static nextID(all) {
    return String(Date.now());
  }
}
