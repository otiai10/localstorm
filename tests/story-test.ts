/* tslint:disable
    no-unused-expression
*/
jest.unmock('../src/Client');
jest.unmock('../src/Router/Router');
import {Client} from '../src/Client';
import {Router} from '../src/Router/Router';

declare let global: any;

describe('Story: Use Router via Client', () => {
  it('Client should invoke registered controller on Router', () => {
    const r = new Router();
    r.on('foo', (params) => {
      return Promise.resolve({status: 200, request: params});
    });
    global.chrome.runtime.onMessage.addListener(r.listener());

    const client = new Client(global.chrome.runtime);
    return client.message('foo', {abc: true}).then((res) => {
      res.request.abc.should.be.true;
      true.should.be.true;
    });
  });

  // eslint-disable-next-line max-len
  it('Client Result Promise should be resolved even when registered controller returns plain object', () => {
    const r = new Router();
    r.on('foo', (params) => {
      return {status: 200, request: params};
    });
    global.chrome.runtime.onMessage.addListener(r.listener());

    const client = new Client(global.chrome.runtime);
    return client.message('foo', {abc: true}).then((res) => {
      res.request.abc.should.be.true;
      true.should.be.true;
    });
  });
  it('Client Promise should be rejected if routing is not found', (done) => {
    const r = new Router();
    r.on('foo', (params) => {
      return Promise.resolve({status: 200, request: params});
    });
    global.chrome.runtime.onMessage.addListener(r.listener());

    const client = new Client(global.chrome.runtime);
    return client.message('bar', {abc: true}).catch((err) => {
      err.status.should.equal(404);
      err.message.should.equal('routing not found for "bar"');
      done();
    });
  });
});
