/* eslint require-jsdoc: 0, max-len: 0, prefer-rest-params: 0 */
// TODO
declare function expect(any): any;

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
      DEBUG.should.equal(0);
      INFO.should.equal(1);
      WARN.should.equal(2);
    });
  });

  describe('info', () => {
    it('should output with style', () => {
      const writer = new MockWriter();
      const logger = new Logger(INFO, writer);
      logger.info('foo', 1234);
      writer.results[0].should.equal('%c[foo]%c');
      writer.results[1].should.equal('color: blue; font-weight: bold;');
      writer.results[2].should.equal('');
      writer.results[3].should.equal(1234);
    });
    it('should output with auto-generated tag when it recieve only one arg', () => {
      const writer = new MockWriter();
      const logger = new Logger(INFO, writer);
      logger.info(1234);
      writer.results[1].should.equal('color: blue; font-weight: bold;');
      writer.results[2].should.equal('');
      writer.results[3].should.equal(1234);
    });
    it('should NOT output anything if log level is higher than INFO', () => {
      const writer = new MockWriter();
      const logger = new Logger(WARN, writer);
      logger.info(1234);
      expect(writer.results).to.be.undefined;
    });
  });

  describe('debug', () => {
    it('should output with style', () => {
      const writer = new MockWriter();
      const logger = new Logger(DEBUG, writer);
      logger.debug('bar', {something: true});
      writer.results[0].should.equal('%c[bar]');
      writer.results[1].should.equal('color: #ddd; font-weight: bold;');
      writer.results[2].something.should.be.true;
    });
  });

  describe('warn', () => {
    it('should output with style', () => {
      const writer = new MockWriter();
      const logger = new Logger(WARN, writer);
      logger.warn('bar', {something: true});
      writer.results[0].should.equal('%c[bar]%c');
      writer.results[1].should.equal('color: orange; font-weight: bold;');
      writer.results[2].should.equal('');
      writer.results[3].something.should.be.true;
    });
  });
});
