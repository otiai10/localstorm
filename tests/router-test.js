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
        expect(flag).toBe(1);
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

            expect(count.x).toBe(3);
            expect(count.y).toBe(2);
        });
    });
});
