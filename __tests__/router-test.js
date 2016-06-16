jest.unmock('../src/Router');
import {SerialRouter} from '../src/Router';

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
