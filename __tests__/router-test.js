jest.unmock('../src/Router');
import {Router, SerialRouter} from '../src/Router';

describe('Router', () => {
  it("should match with another keyname", () => {
    let router = new Router();
    let flag = 0;
    router.on('/foo/bar', (message) => {
      flag += 1;
    });
    router.listen({act: '/foo/bar'});
    expect(flag).toBe(1);
  })
})

describe('SerialRouter', () => {
  it("should match an series of targets", () => {
    let srouter = new SerialRouter();
    let flag = 0;
    srouter.on([{foo: /xxx/}, true, {bar: /aaa/}], (a) => {
      flag += 1;
    })

    srouter.listen({bar: "aaabbbccc"});
    srouter.listen({something: 'anything'});
    srouter.listen({foo: "xxx"});

    expect(flag).toBe(1);
  })
})
