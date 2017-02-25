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
    constructor(dictionary = {}) {
        this.dictionary = dictionary;
    }
    getItem(key) {
        const value = this.dictionary[key];
        if (!value) return null;
        return JSON.stringify(value);
    }
    setItem(key, value) {
        this.dictionary[key] = JSON.parse(value);
    }
    removeItem(key) {
        delete this.dictionary[key];
    }
}
