/* eslint require-jsdoc: 0, camelcase: 0, max-len: 0 */
jest.unmock('../src/Model');
jest.unmock('../src/Model/OnMemoryStorage');

import {Model, Types} from '../src';
import OnMemoryStorage from '../src/Model/OnMemoryStorage';

Object.defineProperty(global, 'localStorage', {value: new OnMemoryStorage()});

class Foo extends Model {
    public seq: any;
    public name: string;
    public foo() {
      return 'this is foo!';
    }
}

class Bar extends Model {
    public name: string;
    public age: number;
}
Bar.template = {name: '', age: 20};

class Toto extends Model {
    public static schema = {
      description: Types.string,
      title: Types.string.isRequired,
    };
}
class User extends Model {
    public static schema = {
      age: Types.number.isRequired,
      langs: Types.array.isRequired,
      name: Types.string.isRequired,
    };
    public age: number;
    public name: string;
}

class Game extends Model {
    public static schema = {
      offset: Types.shape({
        left: Types.number,
        top: Types.number,
      }),
      size: Types.shape({
        height: Types.number,
        width: Types.number.isRequired,
      }).isRequired,
    };
}

class Team extends Model {
    public static schema = {
      awards: Types.arrayOf(Types.string),
      created: Types.date,
      leader: Types.reference(User),
      members: Types.arrayOf(Types.reference(User, {eager: true})),
      name: Types.string,
      roles: Types.dictOf(Types.reference(User)),
      watchers: Types.arrayOf(Types.reference(User)),
    };
    protected static __ns = 'organization';
    public awards: string[];
    public leader: User;
    public members: User[];
    public watchers: User[];
    public name: string;
    public created: Date = new Date();
    public roles: { [role: string]: User };
}

describe('Model', () => {
  it('should have customized method', () => {
    const foo = new Foo();
    expect(foo.foo()).toBe('this is foo!');
  });
  describe('all', () => {
    it('should return all saved models', () => {
      const foo = new Foo({});
      foo.save();
      const all = Foo.all();
      expect(Object.keys(all).length).toBe(1);
      expect(Object.keys(all)[0]).toBe(String(foo._id));
      expect(all[foo._id]._id).toBe(foo._id);
    });
    describe('if the schema has `reference` to other models', () => {
      it('should decode the property as the specified model instance', () => {
        const leader = User.create({name: 'otiai1000', age: 31, langs: ['ja']});
        const user_1 = User.create({name: 'otiai1001', age: 32, langs: ['go']});
        const user_2 = User.create({name: 'otiai1002', age: 64, langs: ['python']});
        const team = new Team({
          awards: ['Academy', 'Global Gold'],
          leader,
          members: [user_1, user_2],
          name: 'A great team',
          roles: {
            captain: user_1,
            vice: user_2,
          },
        });
        team.save();
        const found: Team = Team.find<Team>(team._id);
        expect(found).not.toBeUndefined();
        expect(found.awards[0]).toBe('Academy');
        expect(found.leader).toBeInstanceOf(User);
        expect(found.members[0]).toBeInstanceOf(User);
        expect(found.created).toBeInstanceOf(Date);
        expect(found.roles['captain']).toBeInstanceOf(User);
      });
      it('should load the latest properties if `eager: true` is specified', () => {
        const leader = User.create({name: 'otiai1000', age: 21, langs: ['ja']});
        const user_1 = User.create({name: 'otiai1003', age: 17, langs: ['go']});
        const user_2 = User.create({name: 'otiai1004', age: 19, langs: ['python']});
        const team = Team.new<Team>({
          awards: ['foo', 'baa'],
          leader,
          members: [user_1, user_2],
          name: 'Another great team',
          watchers: [user_1],
        });
        team.save();
        let found: Team = Team.find<Team>(team._id);
        expect(found.members[0].age).toBe(17);
        expect(found.members[1].age).toBe(19);
        expect(found.watchers[0].age).toBe(17);
        // Update only user_1, who is in `members` and `watchers`
        user_1.update({age: 88});
        found = Team.find<Team>(team._id);
        // Because `members` prop is referenced with `eager: true`,
        // it should be the latest state of that member.
        expect(found.members[0].age).toBe(88);
        expect(found.watchers[0].age).toBe(17);
        expect(found.members[0]._id).toBe(found.watchers[0]._id);
      });
    });
  });
  describe('list', () => {
    it('should return all saved models but as a array', () => {
      Foo.new({}).save();
      expect(Foo.list()).toBeInstanceOf(Array);
    });
    describe('when it\'s not stored yet', () => {
      class Example extends Model {
                public static default = {
                  a: {name: 'otiai10'},
                  b: {name: 'otiai20'},
                  c: {name: 'otiai30'},
                };
                public name: string;
      }
      it('should return default dictionary as a list', () => {
        const list = Example.list();
        expect(list.length).toBe(3);
      });
    });
  });
  describe('save', () => {
    it('should generate _id', () => {
      const foo = new Foo();
      expect(foo._id).toBeUndefined();
      foo.save();
      expect(foo._id).not.toBeUndefined();
    });
    describe('if the model has __ns property', () => {
      it('should save the model under the given __ns inside Storage', () => {
        const team = new Team();
        expect(team._id).toBeUndefined();
        team.save();
        expect(team._id).not.toBeUndefined();
        expect(Team.__storage.getItem('Team')).toBeNull();
        expect(Team.__storage.getItem('organization')).not.toBeNull();
      });
    });
  });
  describe('update', () => {
    it('should update properties of this (as a short hand for `save`)', () => {
      const foo = Foo.create({name: 'otiai10'});
      const bar: Foo = Foo.find(foo._id);
      expect(bar.name).toBe('otiai10');
      expect(bar.update({name: 'otiai20'})).toBeInstanceOf(Foo);
      const baz: Foo = Foo.find(foo._id);
      expect(baz.name).toBe('otiai20');
    });
    /* Now we're using TypeScript!! */
    // describe('when given parameter is not a dictionary', () => {
    //     it('should return false', () => {
    //         let foo = Foo.create({name: 'otiai10'});
    //         let bar = Foo.find(foo._id);
    //         bar.update('name', 'otiai30').should.equal(false);
    //         bar.errors.length.should.equal(1);
    //     });
    // });
    describe('even when template is defined', () => {
      it('should update only given fields', () => {
        class FooBar extends Model {
                    public static template = {
                      xxx: {yyy: 1000},
                      zzz: true,
                    };
                    public xxx: object;
                    public zzz: boolean;
        }
        const foobar: FooBar = FooBar.create();
        expect(foobar.xxx['yyy']).toBe(1000);
        expect(foobar.zzz).toBe(true);
        foobar.update({zzz: false});
        const x: FooBar = FooBar.find(foobar._id);
        expect(x.zzz).toBe(false);
        expect(x.xxx['yyy']).toBe(1000);
        x.update({xxx: {yyy: 2000}});
        const z: FooBar = FooBar.find(foobar._id);
        expect(z.zzz).toBe(false);
        expect(x.xxx['yyy']).toBe(2000);
      });
    });
  });
  describe('delete', () => {
    it('should delete data from storage', () => {
      const foo = new Foo({}, 'foo');
      foo.save();
      expect(foo._id).not.toBeUndefined();
      expect(foo.delete()).toBe(true);
      const bar = Foo.find('foo');
      expect(bar).toBeUndefined();
    });
  });
  describe('create', () => {
    it('should construct and `save` instance with properties', () => {
      const foo: Foo = Foo.create({name: 'otiai40'});
      expect(foo._id).not.toBeUndefined();
      const baz: Foo = Foo.find(foo._id);
      expect(baz.name).not.toBeUndefined();
      expect(baz.name).toBe(foo.name);
    });
    describe('when given no any arguments', () => {
      it('should create model with template or empty object', () => {
        class Spamy extends Model {}
        const spamy = Spamy.create();
        expect(spamy).not.toBeUndefined();
        expect(spamy._id).not.toBeUndefined();
        class Hammy extends Model {
                    public static template = {name: 'Mr. Anonymous'};
                    public static nextID = Model.sequentialID;
                    public name: string;
        }
        const hammy: Hammy = Hammy.create();
        expect(hammy).not.toBeUndefined();
        expect(hammy._id).not.toBeUndefined();
        expect(hammy.name).toBe('Mr. Anonymous');
      });
    });
  });
  describe('find', () => {
    describe('even when the Model is already stored once', () => {
      class Example extends Model {
                public static default = {
                  a: {name: 'otiai10'},
                  b: {name: 'otiai20'},
                  // c: { name: 'otiai30' },
                };
      }
      it('should return default value for given ID', () => {
        const another = Example.find('a');
        expect(another).not.toBeUndefined();
        another.update({name: 'otiai10-updated'});
        expect(Example.find('b')).not.toBeUndefined();
        // When "default" has been changed later.
        Example.default['c'] = {name: 'otiai30'};
        const newcomer = Example.find('c');
        expect(newcomer).not.toBeNull();
      });
    });
  });
  describe('filter', () => {
    it('should return filtered models', () => {
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
        const foo: Foo = new Foo({seq: i}, `foo-${i}`);
        foo.save();
      });
      expect(Foo.filter<Foo>((foo) => foo.seq % 2 === 0).length).toBe(5);
      expect(Foo.filter<Foo>((foo) => foo.seq % 3 === 0).length).toBe(4);
      expect(Foo.filter<Foo>((foo) => foo.seq % 5 === 0).length).toBe(2);
      const foo = Foo.filter<Foo>((foo) => foo.seq % 2 === 0).pop();
      expect(foo.constructor.name).toBe('Foo');
    });
  });
  describe('drop', () => {
    it('should remove everything from this namespace', () => {
      [10, 11, 12, 13, 14, 15, 16].map((i) => {
        const foo = new Foo({seq: i}, `foo-${i}`);
        foo.save();
      });
      expect(Foo.filter(() => true).length).not.toBe(0);
      Foo.drop();
      expect(Foo.filter(() => true).length).toBe(0);
    });
  });
  describe('new', () => {
    it('should be an alias for constructor expression', () => {
      const bar: Bar = Bar.new();
      expect(bar).toBeInstanceOf(Bar);
      expect(bar._id).toBeUndefined();
      expect(bar.name).not.toBeUndefined();
      expect(bar.name).toBe('');
      expect(bar.age).not.toBeUndefined();
      expect(bar.age).toBe(20);
      expect(bar.save()._id).not.toBeUndefined();
    });
  });
  describe('static nextID', () => {
    it('should generate next ID by combining current timestamp and appendix by default', () => {
      const now = Date.now();
      const id = Model.nextID() as string;
      expect(parseInt(id.split('.')[0], 10)).toBeCloseTo(now - 10, -4);
    });
    it('should be called when new model is saved', () => {
      const now = Date.now();
      const foo = new Foo();
      foo.save();
      expect(parseInt(foo._id.split('.')[0], 10)).toBeGreaterThan(now - 100);
      expect(parseInt(foo._id.split('.')[0], 10)).toBeLessThan(now + 100);
    });
    it('should be customized by setting function, like serial id', () => {
      const nextID = (all) => {
        return Object.keys(all).length;
      };
      Foo.nextID = nextID;
      const foo = Foo.create({});
      expect(foo._id).toBe(1);
      const bar = Foo.create({});
      expect(bar._id).toBe(2);
    });
    it('should be replaced by prepared functions: e.g. `sequentialID`', () => {
      class Spam extends Model {
                public static nextID = Model.sequentialID;
      }
      const foo = Spam.create({});
      expect(foo._id).toBe(1);
      const bar = Spam.create({});
      expect(bar._id).toBe(2);
      foo.delete();
      const baz = Spam.create({});
      expect(baz._id).toBe(3);
      const hoge = Spam.create({});
      expect(hoge._id).toBe(4);
      const fuga = Spam.create({});
      expect(fuga._id).toBe(5);
    });
    /* Now we are using TypeScript! Yay! */
    // describe('when invalid `nextID` is set', () => {
    //     it('should be failed over with `timestampID`', () => {
    //         const now = Date.now();
    //         Ham.nextID = 'not-function';
    //         let foo = Ham.create({});
    //         expect(foo._id).to.be.within(now - 100, now + 100);
    //     });
    // });
  });
  describe('template', () => {
    it('should provide a way to preset props', () => {
      class Foo extends Model {
                public static template = {
                  age: 10,
                  name: 'templated',
                };
                public age: number;
                public name: string;
      }
      const foo: Foo = Foo.new();
      expect(foo.name).toBe('templated');
      expect(foo.age).toBe(10);
      expect(foo._id).toBeUndefined();
    });
    describe('when one of template is function', () => {
      it('should provide templated value with executing that function', () => {
        class Foo extends Model {
                    public static template = {
                      age: Math.floor(Math.random() * 29) + 1,
                      name: `generated-${Date.now()}`,
                    };
                    public age: number;
                    public name: string;
        }
        const foo: Foo = Foo.new();
        expect(foo.name).toMatch(/generated-[0-9]+/);
        expect(foo.age).toBeGreaterThanOrEqual(1);
        expect(foo.age).toBeLessThan(30);
        expect(foo._id).toBeUndefined();
      });
    });
  });
  describe('schema', () => {
    // TODO: write more cases
    it('should validate props', () => {
      const foo = Toto.new({
        description: 'this is description',
      });
      return new Promise((ok, ng) => {
        try {
          foo.save();
          ng(new Error('saving without title SHOULD throw error, but it was successful'));
        } catch (err) {
          expect(err.message).toBe('title is marked as required');
          ok({});
        }
      });
    });
    describe('for basic primitives which are able to be stored in localStorage', () => {
      const foo = User.new({
        age: '21',
        langs: ['go', 'javascript', 'swift'],
        name: 'otiai10',
      });
      try {
        foo.save();
        throw new Error('saving without title SHOULD throw error, but it was successful');
      } catch (err) {
        expect(err.message).toBe('age is not number');
      }
    });
    describe('shape', () => {
      describe('when required shape is missing', () => {
        const foo = Game.new({
          offset: {},
        });
        try {
          foo.save();
          throw new Error('saving without title SHOULD throw error, but it was successful');
        } catch (err) {
          expect(err.message).toBe('size is marked as required');
        }
      });
      describe('when required shape is given but not satisfied', () => {
        const foo = Game.new({
          offset: {},
          size: {},
        });
        try {
          foo.save();
          throw new Error('saving without title SHOULD throw error, but it was successful');
        } catch (err) {
          expect(err.message).toBe('width is marked as required');
        }
      });
      describe('when required shape is given but not satisfied', () => {
        const foo = Game.new({
          offset: {},
          size: {width: 200, height: 100},
        });
        foo.save();
      });
      describe('when required shapes are given but invalid fields passed', () => {
        const foo = Game.new({
          offset: {left: 'string string'},
          size: {width: 200, height: 100},
        });
        try {
          foo.save();
          throw new Error('saving without title SHOULD throw error, but it was successful');
        } catch (err) {
          expect(err.message).toBe('left is not number');
        }
      });
    });
  });
  describe('useStorage', () => {
    it('should replace localStorage', () => {
      const storage = new OnMemoryStorage({Hoge: {1: {name: 'otiai10'}}});
      Model.useStorage(storage);
      class Hoge extends Model {
                public name: string;
      }
      expect(Hoge.find<Hoge>(1).name).toBe('otiai10');
      Model.useStorage(global.localStorage);
      expect(Hoge.find(1)).toBeUndefined();
    });
    it('should raise error if given storage doesn\'t satisfy Storage interface', () => {
      return Promise.all([
        new Promise((ok, ng) => {
          const storage = {};
          try {
            Model.useStorage(storage);
            ng(new Error('invalid assignment to storage SHOULD RAISE ERROR'));
          } catch (err) {
            expect(err.message).toBe('`getItem` of Storage interface is missing');
            ok({});
          }
        }),
        new Promise((ok, ng) => {
          const storage = {getItem: () => {}, setItem: () => {}, removeItem: () => {}};
          try {
            Model.useStorage(storage);
            ng(new Error('invalid assignment to storage SHOULD RAISE ERROR'));
          } catch (err) {
            expect(err.message).toBe('`getItem` of Storage must accept at least 1 argument');
            ok({});
          }
        }),
      ]);
    });
  });
});
