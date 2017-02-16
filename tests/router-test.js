jest.unmock('../src/Router/Router');
import {Router} from '../src/Router/Router';

describe('Router', () => {
    it('should match with another keyname', () => {
        let router = new Router();
        let flag = 0;
        router.on('/foo/bar', () => {
            flag += 1;
        });
        router.listen({act: '/foo/bar'});
        expect(flag).to.equal(1);
    });
    describe('resolveFunc for constructor', () => {
        it('should change resolve rule', () => {
            let count = {x: 0, y:0};
            const resolveFunc = (message) => {
                return (message.match(/foo/)) ? {name:'xx'} : {name:'yy'};
            };
            let router = new Router(resolveFunc);
            router.on('xx', () => { count.x += 1; });
            router.on('yy', () => { count.y += 1; });

            router.listen('foobar');
            router.listen('foobar');
            router.listen('foobar');
            router.listen('spamham');
            router.listen('spamham');

            expect(count.x).to.equal(3);
            expect(count.y).to.equal(2);
        });
    });
    describe('when matched controller doesn\'t return anything', () => {
        it('should return status 500 with message', () => {
            let router = new Router();
            router.on('xx', () => { });
            const NiceController = () => { };
            router.on('yy', NiceController);
            return Promise.all([
                new Promise(resolve => {
                    router.listen({act: 'xx'}, {}, (res) => {
                        expect(res.status).to.equal(500);
                        expect(res.message).to.equal('`(anonymous controller)`: Response should be defined. ex) return true;');
                        resolve();
                    });
                }),
                new Promise(resolve => {
                    router.listen({act: 'yy'}, {}, (res) => {
                        expect(res.status).to.equal(500);
                        expect(res.message).to.equal('`NiceController`: Response should be defined. ex) return true;');
                        resolve();
                    });
                })
            ]);
        });
    });
});
