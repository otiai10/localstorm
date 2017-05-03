jest.unmock('../src/Client');
jest.unmock('../src/Router');
import {Client} from '../src/Client';
import {Router} from '../src/Router';

beforeAll(() => {
    let r = new Router();
    r.on('/echo', (message) => Promise.resolve({echo: message}));
    global.chrome.runtime.onMessage.addListener(r.listener());

    let tabr = new Router();
    tabr.on('/echo', (message) => Promise.resolve({echo: message}));
    global.chrome.tabs.onMessage.addListener(tabr.listener());
});

describe('Client', () => {
    describe('message', () => {
        describe('when the first parameter is object', () => {
            it('should be accepted with `action` field of the first argument', () => {
                let client = new Client(global.chrome.runtime);
                return client.message({action:'/echo', greet: 'Hello!'})
                .then(res => {
                    res.data.echo.action.should.equal('/echo');
                    res.data.echo.greet.should.equal('Hello!');
                    return Promise.resolve();
                });
            });
        });
        describe('only with action string', () => {
            it('should send object including that action', () => {
                let client = new Client(global.chrome.runtime);
                return Promise.all([
                    client.message('/echo').then(res => {
                        res.data.echo.action.should.equal('/echo');
                        expect(true).to.be.true;
                        return Promise.resolve();
                    }),
                    client.message('/echo', {greet: 'Gute Nacht!'}).then(res => {
                        res.data.echo.greet.should.equal('Gute Nacht!');
                        return Promise.resolve();
                    })
                ]);
            });
        });
        describe('when the last argument is function', () => {
            it('should not return promise, but that callback should be called', () => {
                let client = new Client(global.chrome.runtime);
                return Promise.all([
                    new Promise(resolve => client.message('/echo', (res) => {
                        res.data.echo.action.should.equal('/echo');
                        resolve();
                    })),
                    new Promise(resolve => client.message('/echo', {greet:'Morgen!'}, (res) => {
                        res.data.echo.greet.should.equal('Morgen!');
                        resolve();
                    }))
                ]);
            });
        });
    });
    describe('tab', () => {
        it('should provide TargetedClient', () => {
            let client = new Client(global.chrome.tabs);
            return client.tab(100).message('/echo').then(res => {
                console.log(res.data.echo.tab.id);
                expect(res.data.echo.tab.id).not.be.undefined;
                res.data.echo.tab.id.should.equal(100);
                return Promise.resolve();
            });
        });
        describe('static method `for`', () => {
            it('should be just a shorthand of constructing TargetedClient directly', () => {
                return Client.for(global.chrome.tabs, 123).message('/echo').then(res => {
                    expect(res.data.echo.tab.id).not.be.undefined;
                    res.data.echo.tab.id.should.equal(123);
                    return Promise.resolve();
                });
            });
        });
    });
});
