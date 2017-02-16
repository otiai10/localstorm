jest.unmock('../src/Client');
jest.unmock('../src/Router/Router');
import {Client} from '../src/Client';
import {Router} from '../src/Router/Router';

describe('Story: Use Router via Client', () => {
    it('Client should invoke registered controller on Router', () => {
        let r = new Router();
        r.on('foo', (params) => {
            return Promise.resolve({status: 200, request: params});
        });
        window.chrome.runtime.onMessage.addListener(r.listener());

        const client = new Client(window.chrome.runtime);
        return client.message('foo', {abc: true}).then(res => {
            expect(res.request.abc).to.equal(true);
            expect(true).to.equal(true);
        });
    });
    it('Client Result Promise should be resolved even when registered controller returns plain object', () => {
        let r = new Router();
        r.on('foo', (params) => {
            return {status: 200, request: params};
        });
        window.chrome.runtime.onMessage.addListener(r.listener());

        const client = new Client(window.chrome.runtime);
        return client.message('foo', {abc: true}).then(res => {
            expect(res.request.abc).to.equal(true);
            expect(true).to.equal(true);
        });
    });
    it('Client Promise should be rejected if routing is not found', (done) => {
        let r = new Router();
        r.on('foo', (params) => {
            return Promise.resolve({status: 200, request: params});
        });
        window.chrome.runtime.onMessage.addListener(r.listener());

        const client = new Client(window.chrome.runtime);
        return client.message('bar', {abc: true}).catch(err => {
            expect(err.status).to.equal(404);
            expect(err.message).to.equal('routing not found for "bar"');
            done();
        });
    });
});
