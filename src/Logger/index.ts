/* tslint:disable
    no-console
    interface-name
    variable-name
    max-classes-per-file
*/

declare interface Writer {
    write: (...any) => any;
}

export class Logger {

    public level: number;
    public writer: Writer;

    constructor(level = DEBUG, writer = {write() {
        const args = Array.prototype.slice.call(arguments);
        console.log(...args);
    }}) {
        this.level = level;
        this.writer = writer;
    }
    public debug(tag, body) {
        if (this.level > DEBUG) { return; }
        const [_tag, _body] = (arguments.length >= 2) ? [tag, body] : [this.fromStack(), tag];
        this.writer.write(`%c[${_tag}]`, "color: #ddd; font-weight: bold;", _body);
    }
    public info(tag, body) {
        if (this.level > INFO) { return; }
        const [_tag, _body] = (arguments.length >= 2) ? [tag, body] : [this.fromStack(), tag];
        this.writer.write(`%c[${_tag}]%c`, "color: blue; font-weight: bold;", "", _body);
    }
    public warn(tag, body) {
        if (this.level > WARN) { return; }
        const [_tag, _body] = (arguments.length >= 2) ? [tag, body] : [this.fromStack(), tag];
        this.writer.write(`%c[${_tag }]%c`, "color: orange; font-weight: bold;", "", _body);
    }
    public fromStack(depth = 3) {
        return (new Error()).stack.split("\n")[depth].trim(); // .split(' ').slice(0,2).join(' ')
    }
}

export const DEBUG = 0;
export const INFO  = 1;
export const WARN  = 2;

export class DummyLogger {
    public debug() {/* do nothing */}
    public info() {/* do nothing */}
    public warn() {/* do nothing */}
}
