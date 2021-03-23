/* eslint require-jsdoc: 0, max-len: 0, prefer-rest-params: 0 */

jest.unmock('../src/Logger');
import {DEBUG, INFO, Logger, WARN} from '../src/Logger';

class MockWriter {
    public results: any;
    public write() {
      this.results = Object.assign({}, arguments);
    }
}

describe('Logger', () => {
  describe('levels', () => {
    it('should be static variable, representing log levels', () => {
      expect(DEBUG).toBe(0);
      expect(INFO).toBe(1);
      expect(WARN).toBe(2);
    });
  });

  describe('info', () => {
    it('should output with style', () => {
      const writer = new MockWriter();
      const logger = new Logger(INFO, writer);
      logger.info('foo', 1234);
      expect(writer.results[0]).toBe('%c[foo]%c');
      expect(writer.results[1]).toBe('color: blue; font-weight: bold;');
      expect(writer.results[2]).toBe('');
      expect(writer.results[3]).toBe(1234);
    });
    it('should output with auto-generated tag when it recieve only one arg', () => {
      const writer = new MockWriter();
      const logger = new Logger(INFO, writer);
      logger.info(1234);
      expect(writer.results[1]).toBe('color: blue; font-weight: bold;');
      expect(writer.results[2]).toBe('');
      expect(writer.results[3]).toBe(1234);
    });
    it('should NOT output anything if log level is higher than INFO', () => {
      const writer = new MockWriter();
      const logger = new Logger(WARN, writer);
      logger.info(1234);
      expect(writer.results).toBeUndefined();
    });
  });

  describe('debug', () => {
    it('should output with style', () => {
      const writer = new MockWriter();
      const logger = new Logger(DEBUG, writer);
      logger.debug('bar', {something: true});
      expect(writer.results[0]).toBe('%c[bar]');
      expect(writer.results[1]).toBe('color: #ddd; font-weight: bold;');
      expect(writer.results[2]).toBeTruthy();
    });
  });

  describe('warn', () => {
    it('should output with style', () => {
      const writer = new MockWriter();
      const logger = new Logger(WARN, writer);
      logger.warn('bar', {something: true});
      expect(writer.results[0]).toBe('%c[bar]%c');
      expect(writer.results[1]).toBe('color: orange; font-weight: bold;');
      expect(writer.results[2]).toBe('');
      expect(writer.results[3]).toBeTruthy();
    });
  });
});
