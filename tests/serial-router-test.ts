jest.unmock('../src/Router/SerialRouter');
import {SerialRouter} from '../src/Router/SerialRouter';

describe('SerialRouter', () => {
  describe('when strings are given as match conditions', () => {
    it('should match an series of targets by perfect match', () => {
      const srouter = new SerialRouter();
      let flag = 0;
      srouter.on([{foo: 'xxx'}, true, {bar: 'aaabbbccc'}], () => {
        flag += 1;
      });
      srouter.listen({bar: 'aaabbbccc'});
      srouter.listen({something: 'anything'});
      srouter.listen({foo: 'xxx'});
      flag.should.equal(1);
    });
  });
  describe('when Regexp are given as match conditions', () => {
    it('should match by regex match', () => {
      const srouter = new SerialRouter();
      let flag = 0;
      srouter.on([{foo: /^\/user\/[0-9]+$/}, true, {bar: 'aaabbbccc'}], () => {
        flag += 1;
      });
      srouter.listen({bar: 'aaabbbccc'});
      srouter.listen({something: 'anything'});
      srouter.listen({foo: 'xxx'});
      flag.should.equal(0);

      srouter.listen({bar: 'aaabbbccc'});
      srouter.listen({something: 'anything'});
      srouter.listen({foo: '/user/12345'});
      flag.should.equal(1);
    });
  });
  describe('when resolver func is given', () => {
    it('should match controllers by given rules', () => {
      const resolver = {
        x: (val = '') => {
          const [prefix] = val.split('/');
          return prefix;
        },
        y: (val = '') => {
          const [, suffix] = val.split('.');
          return suffix;
        },
      };
      let flag = 0;
      const r = new SerialRouter(3, resolver);
      r.on([{y: 'salt'}, true, {x: 'sugar'}], () => {
        flag += 100;
      });
      flag.should.equal(0);

      r.listen({x: 'sugar/soul'});
      r.listen({z: 'anything'});
      r.listen({y: 'summer.salt'});
      flag.should.equal(100);
    });
  });

  // eslint-disable-next-line max-len
  describe('when given resolver is simple function and given matchers are string', () => {
    it('should match controllers according to resolver', () => {
      const resolver = (detail) => {
        return [detail.x, detail.y].join('.');
      };
      let flag = 0;
      const r = new SerialRouter(3, resolver);
      r.on(['jack.daniels', true, 'early.times'], () => {
        flag += 17;
      });

      r.listen({x: 'early', y: 'times'});
      r.listen({z: 'anything'});
      r.listen({x: 'jack', y: 'daniels'});
      flag.should.equal(17);
    });
  });
});
