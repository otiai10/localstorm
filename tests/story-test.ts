jest.unmock('../src/Client');
jest.unmock('../src/Router/Router');
import {Client} from '../src/Client';
import {Router} from '../src/Router/Router';

declare let global: any;

describe('Story: Use Router via Client', () => {
  it('Client should invoke registered controller on Router', async (ok) => {
    const r = new Router();
    r.on('foo', (params) => Promise.resolve({status: 200, request: params}));
    global.chrome.runtime.onMessage.addListener(r.listener());

    const client = new Client(global.chrome.runtime);
    const res = await client.message('foo', {abc: true});
    expect(res.request.abc).toBeTruthy();
    ok();
  });

  // eslint-disable-next-line max-len
  it('Client Result Promise should be resolved even when registered controller returns plain object', async (ok) => {
    const r = new Router();
    r.on('foo', (params) => ({status: 200, request: params}));
    global.chrome.runtime.onMessage.addListener(r.listener());

    const client = new Client(global.chrome.runtime);
    const res = await client.message('foo', {abc: true});
    expect(res.request.abc).toBeTruthy();
    ok();
  });
  // eslint-disable-next-line max-len
  it('Client Promise should be rejected if routing is not found', async (ok) => {
    const r = new Router();
    r.on('foo', (params) => {
      return Promise.resolve({status: 200, request: params});
    });
    global.chrome.runtime.onMessage.addListener(r.listener());

    const client = new Client(global.chrome.runtime);
    try {
      await client.message('bar', {abc: true});
    } catch (err) {
      expect(err.status).toBe(404);
      expect(err.message).toBe('routing not found for "bar"');
      ok();
    }
  });
});
