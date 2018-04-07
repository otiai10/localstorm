/**
 * `OnMemoryStorage` is used instead of `window.localStorage`.
 * I hope you don't need it.
 */

/*
interface ChomexStorage {
  getItem(key: string): string?;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
*/

export default class OnMemoryStorage {
    dictionary: Object;
    constructor(dictionary = {}) {
        this.dictionary = dictionary;
    }
    getItem(key) {
        const value = this.dictionary[key];
        return value ? value : null;
    }
    setItem(key, value) {
        this.dictionary[key] = value;
    }
    removeItem(key) {
        delete this.dictionary[key];
    }
}
