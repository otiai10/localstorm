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
    public dictionary: object;
    constructor(dictionary = {}) {
        this.dictionary = dictionary;
    }
    public getItem(key) {
        const value = this.dictionary[key];
        return value ? value : null;
    }
    public setItem(key, value) {
        this.dictionary[key] = value;
    }
    public removeItem(key) {
        delete this.dictionary[key];
    }
}
