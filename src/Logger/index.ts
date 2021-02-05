declare interface Writer {
    write: (...any) => any;
}

/**
 * Logger
 */
export class Logger {
    private level: number;
    private writer: Writer;

    /**
     * @param {number} level
     * @param {{write}} writer
     */
    constructor(level = DEBUG, writer = {write() {
      /* eslint prefer-rest-params: 0 */
      const args = Array.prototype.slice.call(arguments);
      console.log(...args);
    }}) {
      this.level = level;
      this.writer = writer;
    }

    /**
     * @param {any} tag
     * @param {any} body
     */
    public debug(tag, body) {
      if (this.level > DEBUG) {
        return;
      }
      const [_tag, _body] = (arguments.length >= 2) ?
        [tag, body] : [this.fromStack(), tag];
      this.writer.write(
          `%c[${_tag}]`,
          'color: #ddd; font-weight: bold;',
          _body,
      );
    }

    /**
     * @param {any} tag
     * @param {any} body
     */
    public info(tag, body?: any) {
      if (this.level > INFO) {
        return;
      }
      const [_tag, _body] = (arguments.length >= 2) ?
        [tag, body] : [this.fromStack(), tag];
      this.writer.write(
          `%c[${_tag}]%c`,
          'color: blue; font-weight: bold;',
          '', _body,
      );
    }

    /**
     * @param {any} tag
     * @param {any} body
     */
    public warn(tag, body) {
      if (this.level > WARN) {
        return;
      }
      const [_tag, _body] = (arguments.length >= 2) ?
        [tag, body] : [this.fromStack(), tag];
      this.writer.write(
          `%c[${_tag }]%c`,
          'color: orange; font-weight: bold;',
          '', _body,
      );
    }

    /**
     * @param {number} depth
     * @return {Error}
     */
    public fromStack(depth = 3) {
      return (new Error()).stack.split('\n')[depth].trim();
      // .split(' ').slice(0,2).join(' ')
    }
}

export const DEBUG = 0;
export const INFO = 1;
export const WARN = 2;

/**
 * DummyLogger
 */
export class DummyLogger {
  /* eslint require-jsdoc: 0 */
  public debug() {/* do nothing */}
  public info() {/* do nothing */}
  public warn() {/* do nothing */}
}
