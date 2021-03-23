/* eslint max-len: 0 */
jest.unmock('../src/Client');
jest.unmock('../src/Router');
import {Client, Router} from '../src';

declare let global: any;

beforeAll(() => {
  // TODO: Use jestil instead
  //       See https://github.com/otiai10/jestil
  const r = new Router();
  r.on('/echo', (message) => Promise.resolve({echo: message}));
  global.chrome.runtime.onMessage.addListener(r.listener());

  const tabr = new Router();
  tabr.on('/echo', (message) => Promise.resolve({echo: message}));
  global.chrome.tabs.onMessage.addListener(tabr.listener());
});

describe('Client', () => {
  describe('message', () => {
    describe('when the first parameter is object', () => {
      it('should be accepted with `action` field of the first argument', () => {
        const client: Client = new Client(global.chrome.runtime);
        return client.message<any>({action: '/echo', greet: 'Hello!'})
            .then((res) => {
              expect(res.data.echo.action).toBe('/echo');
              expect(res.data.echo.greet).toBe('Hello!');
              return Promise.resolve();
            });
      });
    });
    describe('only with action string', () => {
      it('should send object including that action', () => {
        const client = new Client(global.chrome.runtime);
        return Promise.all([
          client.message('/echo').then((res) => {
            expect(res.data.echo.action).toBe('/echo');
            expect(true).toBeTruthy();
            return Promise.resolve();
          }),
          client.message('/echo', {greet: 'Gute Nacht!'}).then((res) => {
            expect(res.data.echo.greet).toBe('Gute Nacht!');
            return Promise.resolve();
          }),
        ]);
      });
    });
    describe('when the last argument is function', () => {
      it('should not return promise, but that callback should be called', () => {
        const client = new Client(global.chrome.runtime);
        return Promise.all([
          new Promise((resolve) => client.message('/echo', (res) => {
            expect(res.data.echo.action).toBe('/echo');
            resolve({});
          })),
          new Promise((resolve) => client.message('/echo', {greet: 'Morgen!'}, (res) => {
            expect(res.data.echo.greet).toBe('Morgen!');
            resolve({});
          })),
        ]);
      });
    });
    describe('when controller found but response is empty', () => {
      it('should NOT throw exception, and returns 202 Accepted', (ok) => {
        const client = new Client(global.chrome.runtime, false);
        return client.message('/empty').then((res) => {
          expect(res.status).toBe(202);
          ok();
        });
      });
    });
  });
  describe('tab', () => {
    it('should provide TargetedClient', () => {
      const client = new Client(global.chrome.tabs);
      return client.tab(100).message('/echo').then((res) => {
        expect(res.data.echo.tab.id).not.toBeUndefined();
        expect(res.data.echo.tab.id).toBe(100);
        return Promise.resolve();
      });
    });
    describe('static method `for`', () => {
      it('should be just a shorthand of constructing TargetedClient directly', () => {
        return Client.for(global.chrome.tabs, 123).message('/echo').then((res) => {
          expect(res.data.echo.tab.id).not.toBeUndefined();
          expect(res.data.echo.tab.id).toBe(123);
          return Promise.resolve();
        });
      });
    });
  });
});
