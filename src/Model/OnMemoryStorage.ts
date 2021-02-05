/*
interface ChomexStorage {
  getItem(key: string): string?;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
*/

/**
 * `OnMemoryStorage` is used instead of `window.localStorage`.
 * I hope you don't need it.
 */
export default class OnMemoryStorage {
    public dictionary: object;
    /**
     * @param {Object} dictionary
     */
    constructor(dictionary = {}) {
      this.dictionary = dictionary;
    }

    /**
     * @param {string} key
     * @return {string}
     */
    public getItem(key) {
      const value = this.dictionary[key];
      return value ? value : null;
    }

    /**
     * @param {string} key
     * @param {any} value
     */
    public setItem(key, value) {
      this.dictionary[key] = value;
    }

    /**
     * @param {string} key
     */
    public removeItem(key) {
      delete this.dictionary[key];
    }
}
