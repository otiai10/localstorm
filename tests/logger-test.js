jest.unmock('../src/Logger');
import {Logger, DEBUG, INFO, WARN} from '../src/Logger';

class MockWriter {
    write() { this.results = Object.assign({}, arguments); }
}

describe('Logger', () => {

    describe('levels', () => {
        it('should be static variable, representing log levels', () => {
            expect(DEBUG).to.equal(0);
            expect(INFO).to.equal(1);
            expect(WARN).to.equal(2);
        });
    });

    describe('info', () => {
        it('should output with style', () => {
            let writer = new MockWriter();
            const logger = new Logger(INFO, writer);
            logger.info('foo', 1234);
            expect(writer.results[0]).to.equal('%c[foo]%c');
            expect(writer.results[1]).to.equal('color: blue; font-weight: bold;');
            expect(writer.results[2]).to.equal('');
            expect(writer.results[3]).to.equal(1234);
        });
        it('should output with auto-generated tag when it recieve only one arg', () => {
            let writer = new MockWriter();
            const logger = new Logger(INFO, writer);
            logger.info(1234);
            expect(writer.results[1]).to.equal('color: blue; font-weight: bold;');
            expect(writer.results[2]).to.equal('');
            expect(writer.results[3]).to.equal(1234);
        });
        it('should NOT output anything if log level is higher than INFO', () => {
            let writer = new MockWriter();
            const logger = new Logger(WARN, writer);
            logger.info(1234);
            expect(writer.results).to.equal(undefined);
        });
    });

    describe('debug', () => {
        it('should output with style', () => {
            let writer = new MockWriter();
            const logger = new Logger(DEBUG, writer);
            logger.debug('bar', {something: true});
            expect(writer.results[0]).to.equal('%c[bar]');
            expect(writer.results[1]).to.equal('color: #ddd; font-weight: bold;');
            expect(writer.results[2].something).to.equal(true);
        });
    });

    describe('warn', () => {
        it('should output with style', () => {
            let writer = new MockWriter();
            const logger = new Logger(WARN, writer);
            logger.warn('bar', {something: true});
            expect(writer.results[0]).to.equal('%c[bar]%c');
            expect(writer.results[1]).to.equal('color: orange; font-weight: bold;');
            expect(writer.results[2]).to.equal('');
            expect(writer.results[3].something).to.equal(true);
        });
    });
});
