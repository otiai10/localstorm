export class Logger {
    constructor(level = DEBUG, writer = {write() {
        console.log(...arguments);
    }}) {
        this.level = level;
        this.writer = writer;
    }
    debug(tag, body) {
        if (this.level > DEBUG) return;
        let [_tag, _body] = (arguments.length >= 2) ? [tag, body] : [this.fromStack(), tag];
        this.writer.write(`%c[${_tag}]`, 'color: #ddd; font-weight: bold;', _body);
    }
    info(tag, body) {
        if (this.level > INFO) return;
        let [_tag, _body] = (arguments.length >= 2) ? [tag, body] : [this.fromStack(), tag];
        this.writer.write(`%c[${_tag}]%c`, 'color: blue; font-weight: bold;', '', _body);
    }
    warn(tag, body) {
        if (this.level > WARN) return;
        let [_tag, _body] = (arguments.length >= 2) ? [tag, body] : [this.fromStack(), tag];
        this.writer.write(`%c[${_tag }]%c`, 'color: orange; font-weight: bold;', '', _body);
    }
    fromStack(depth = 3) {
        return (new Error()).stack.split('\n')[depth].trim();//.split(' ').slice(0,2).join(' ')
    }
}

export const DEBUG = 0;
export const INFO  = 1;
export const WARN  = 2;

export class DummyLogger {
    debug() {}
    info() {}
    warn() {}
}
