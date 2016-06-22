export class Logger {
  constructor(writer = {write() {
    console.log(...arguments);
  }}) {
    this.writer = writer;
  }
  misc(tag, body) {
    let [_tag, _body] = (arguments.length >= 2) ? [tag, body] : [this.fromStack(), tag];
    this.writer.write(`%c[${_tag}]`, 'color: #ddd; font-weight: bold;', _body);
  }
  info(tag, body) {
    let [_tag, _body] = (arguments.length >= 2) ? [tag, body] : [this.fromStack(), tag];
    this.writer.write(`%c[${_tag}]%c`, 'color: blue; font-weight: bold;', '', _body);
  }
  warn(tag, body) {
    let [_tag, _body] = (arguments.length >= 2) ? [tag, body] : [this.fromStack(), tag];
    this.writer.write(`%c[${_tag }]%c`, 'color: orange; font-weight: bold;', '', _body);
  }
  fromStack(depth = 3) {
    return (new Error()).stack.split('\n')[depth].trim();//.split(' ').slice(0,2).join(' ')
  }
}

export class DummyLogger {
  misc() {}
  info() {}
  warn() {}
}
