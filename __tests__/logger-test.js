jest.unmock('../src/Logger');
import {Logger} from '../src/Logger';

class MockWriter {
  write() { this.results = Object.assign({}, arguments); }
}

describe('Logger', () => {
  describe('info', () => {
    it("should output with style", () => {
      let writer = new MockWriter();
      const logger = new Logger(writer);
      logger.info('foo', 1234);
      expect(writer.results[0]).toBe('%c[foo]%c');
      expect(writer.results[1]).toBe('color: blue; font-weight: bold;');
      expect(writer.results[2]).toBe('');
      expect(writer.results[3]).toBe(1234);
    })
    it("should output with auto-generated tag when it recieve only one arg", () => {
      let writer = new MockWriter();
      const logger = new Logger(writer);
      logger.info(1234);
      expect(writer.results[0]).toBe('%c[at Object.eval]%c');
      expect(writer.results[1]).toBe('color: blue; font-weight: bold;');
      expect(writer.results[2]).toBe('');
      expect(writer.results[3]).toBe(1234);
    })
  })

  describe('warn', () => {
    it("should output with style", () => {
      let writer = new MockWriter();
      const logger = new Logger(writer);
      logger.warn('bar', {something: true});
      expect(writer.results[0]).toBe('%c[bar]%c');
      expect(writer.results[1]).toBe('color: orange; font-weight: bold;');
      expect(writer.results[2]).toBe('');
      expect(writer.results[3].something).toBe(true);
    })
  })
})
