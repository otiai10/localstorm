
// declare namespace global {
//     let localStorage: {
//         getItem: () => any;
//         setItem: () => any;
//     };

//     /**
//      * Storage interface
//      */
//     class Storage {
//         public getItem: () => any;
//         public setItem: () => any;
//     }
// }

import OnMemoryStorage from './OnMemoryStorage';

/**
 * Model
 */
export class Model {
    public static default?: any;
    public static template?: any;

  /**
   * @default __storage a wrapper of global.localStorage, with handling Object
   */
  public static __storage = localStorage ?
    Model.implementNativeStorage(localStorage) : new OnMemoryStorage();

  /**
   * implementNativeStorage
   * Implements Storage interface from localStorage/sessionStorage.
   * @param {Storage} nativeStorage: Object which has window.Storage interface.
   * @return {storage} storage: class Object which has Storage interface.
   */
  public static implementNativeStorage(nativeStorage) {
    return new (function() {
      /* eslint no-invalid-this: 0 */
      this.store = nativeStorage;
      this.setItem = function(key, val) {
        this.store.setItem(key, JSON.stringify(val));
      };
      this.getItem = function(key) {
        return JSON.parse(this.store.getItem(key) || 'null');
      };
      this.removeItem = function(key) {
        this.store.removeItem(key);
      };
    });
  }

  /**
   * @param {Storage} storage
   */
  public static useStorage(storage: any = {}) {
    if (Storage && storage instanceof Storage) {
      storage = this.implementNativeStorage(storage);
    }

    if (typeof storage.getItem !== 'function') {
      throw new Error('`getItem` of Storage interface is missing');
    }
    if (typeof storage.setItem !== 'function') {
      throw new Error('`setItem` of Storage interface is missing');
    }
    if (typeof storage.removeItem !== 'function') {
      throw new Error('it doesn\'t satisfy expected Storage interface');
    }
    if (storage.getItem.length < 1) {
      throw new Error('`getItem` of Storage must accept at least 1 argument');
    }
    if (storage.setItem.length < 2) {
      throw new Error('`setItem` of Storage must accept at least 2 argument');
    }
    if (storage.removeItem.length < 1) {
      throw new Error('`removeItem` of Storage must accept at least 1 arg');
    }
    this.__storage = storage;
  }

  /**
   * @param {Object} props
   * @return {Model}
   */
  public static new<T extends Model>(props = {}): T {
    const copy: any = new this(props);
    return copy as T;
  }

  /**
   * @param {Object} dict
   * @return {Model}
   */
  public static create<T extends Model>(dict = (this.template || {})): T {
    if (typeof dict !== 'object') {
      throw new Error(`cannot create a model from ${typeof dict}`);
    }
    const all = this._all();
    const _id = dict._id || this.__nextID(all);
    const model = new this(dict, _id);
    return model.save<T>();
  }

  /**
   * it returs all saved entities **as Models**
   * @return {Record<id, Model>}
   */
  public static all<T extends Model>(): { [id: string]: T } {
    const all = this._all();
    const Self = this;
    Object.keys(all).map((_id) => {
      const _this = new Self(all[_id], _id, Self._ns());
      all[_id] = _this.decode(all[_id]);
    });
    return all;
  }

  /**
   * list is an alias of `Model.filter(() => true);`
   * @return {array} of model instances
   */
  public static list<T extends Model>(): T[] {
    return this.filter(() => true);
  }

  /**
   * @param {string|number} id
   * @return {Model?}
   */
  public static find<T extends Model>(id): T | null {
    const all = this._all();
    const _id = String(id);
    if (all[_id]) {
      const _this = new this(all[_id], _id, this._ns());
      return _this.decode<T>(all[_id]);
    } else if (this.default && this.default[_id]) {
      const _this = new this(this.default[_id], _id, this._ns());
      return _this.decode<T>(this.default[_id]);
    }
    return null;
  }

  /**
   * @param {function} fn
   * @return {Model[]}
   */
  public static filter<T extends Model>(fn: (entry: T) => boolean): T[] {
    const all = this.all<T>();
    const _res: T[] = [];
    Object.keys(all).map((_id) => {
      if (fn(all[_id])) {
        _res.push(all[_id]);
      }
    });
    return _res;
  }

  /**
   *  Drops the database.
   */
  public static drop() {
    this.__storage.removeItem(this._ns());
  }

  /**
   * @static
   * @param {Record<id, Model>} all
   * @return {number|string}
   */
  public static nextID(all?): number | string {
    return this.timestampAndSequentialID(all);
  }

    // FIXME: use "checker" func type?
    protected static schema: any;

    /**
     * Programmers can change the namespace of this model inside the storage.
     * This namespace is "prototype.name" by default.
     * You might need it to avoid problems caused by uglifying/mangling.
     * e.g) `"User"` namespace for `class User extends Model`.
     */
    protected static __ns?: string ;

    /**
     * @return {string}
     */
    protected static _ns(): string {
      return this.__ns || this.name;
    }

    /**
     * @return {number}
     */
    protected static timestampID(): number {
      return Date.now();
    }

    /**
     * @param {Record<id, Model>} all
     * @return {number}
     */
    protected static sequentialID(all): number {
      return (Object.keys(all)
          .map((id) => parseInt(id, 10))
          .sort((prev, next) => (prev < next) ? -1 : 1)
          .pop() || 0) + 1;
    }

    /**
     * @param {Record<id, Model>} all
     * @return {number}
     */
    protected static timestampAndSequentialID(all = {}): string {
      return `${Date.now()}.${Object.keys(all).length}`;
    }

    /**
     * it returns all saved entities **as Objects**
     * @return {Object}
     */
    private static _all() {
      const all = this.__storage.getItem(this._ns());
      return all || this.default || {};
    }

    /**
     * @param {Record<string, Model>} all
     * @return {number|string}
     */
    private static __nextID(all: {[id: string]: Model}): number | string {
      if (typeof this.nextID === 'function') {
        const id = this.nextID(all);
        if (id === undefined || id === null) {
          console.error('customized `nextID` function provides invalid ID');
          return this.timestampAndSequentialID(all);
        }
        return id;
      }
      return this.timestampAndSequentialID(all);
    }

    public errors: any[];
    public _id: string;

    /**
     * @interface storage
     * @method getItem(key: string): Object?
     * @method setItem(key: string, value: Object?)
     * @method removeItem(key: string)
     */

    /**
     * @param {Object} props
     * @param {string?} id
     * @param {string?} ns
     */
    constructor(props = {}, id?: string, ns?: string) {
      const constructor: any = this.constructor;
      const template = Object.assign({}, constructor.template);
      Object.keys(template).map((key) => {
        if (typeof props[key] !== 'undefined') {
          return;
        }
        props[key] = (typeof template[key] === 'function') ?
          template[key]() : template[key];
      });
      if (id) this._id = id;
      this.decode(props);
    }

    /**
     * @return {T}
     */
    public save<T extends Model>(): T {
      const constructor: any = this.constructor;
      const all = constructor._all();
      if (!this._id) {
        this._id = constructor.__nextID(all);
      }
      this._validate(); // TODO: should be response object??
      all[this._id] = this.encode();
      constructor.__storage.setItem(constructor._ns(), all);
      const copy: any = this;
      return copy as T;
    }

    /**
     * @return {boolean}
     */
    public delete(): boolean {
      // FIXME
      const constructor: any = this.constructor;
      const all = constructor._all();
      if (!this._id) {
        return false;
      }
      if (delete all[this._id] === false) {
        return false;
      }
      constructor.__storage.setItem(constructor._ns(), all);
      return true;
    }

    /**
     * @param {Object} dict
     * @return {T}
     */
    public update<T extends Model>(dict): T {
      if (typeof dict !== 'object') {
        this.error('Argument for `update` must be key-value dictionary');
      } else {
        dict = this._fixture(dict);
        // TODO: filter preserved keywords
        Object.keys(dict).map((key) => this[key] = dict[key]);
      }
      return this.save();
    }

    /**
     * @param {any} err
     * @return {null}
     */
    public error(err) {
      this.errors = this.errors || [];
      this.errors.push(err);
      return null;
    }

    /**
     * @param {Object} obj
     * @return {T}
     */
    public decode<T extends Model>(obj): T {
      // FIXME: wanna get the type of constructor func!!
      const constructor: any = this.constructor;
      const schema = constructor.schema || {};
      Object.keys(obj).map((key) => {
        if (typeof schema[key] === 'function' &&
        typeof schema[key].load === 'function') {
          this[key] = schema[key].load(obj[key]);
        } else {
          this[key] = obj[key];
        }
      });
      const copy: any = this;
      return copy as T;
    }

    /**
     * @return {any}
     */
    public encode(): any {
      const encoded: any = {};
      for (const prop in this) {
        if (!this.hasOwnProperty(prop)) {
          continue;
        }
        // Ignore reserved prop names.
        const reservedProps = ['_props'];
        if (reservedProps.some((x) => x === prop)) {
          continue;
        }
        if (Array.isArray(this[prop])) {
          encoded[prop] = (this[prop] as any).map((v) => {
            return typeof v.encode === 'function' ? v.encode() : v;
          });
        } else {
          encoded[prop] = this[prop];
        }
      }
      return encoded;
    }

    /**
     * @return {null}
     */
    public _validate() {
      const constructor: any = this.constructor;
      if (!constructor.schema) {
        return null;
      }
      Object.keys(constructor.schema).map((propName) => {
        constructor.schema[propName](this[propName], propName);
      });
    }

    /**
     * fixes next properties with template
     * prefer properties this already has and next properties given.
     * @param {Object} props
     * @param {Object} template
     * @return {undefined}
     */
    private _fixture(props, template?) {
      if (typeof template === 'undefined') {
        const constructor: any = this.constructor;
        template = Object.assign({}, constructor.template);
      }
      Object.keys(template).map((key) => {
        if (typeof this[key] !== 'undefined') {
          return;
        }
        if (typeof props[key] !== 'undefined') {
          return;
        }
        props[key] = (typeof template[key] === 'function') ?
          template[key]() : template[key];
      });
      return props;
    }
}
