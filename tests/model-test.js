jest.unmock('../src/Model');
jest.unmock('../src/Model/OnMemoryStorage');

import chomex from '../src/chomex';
import OnMemoryStorage from '../src/Model/OnMemoryStorage';

Object.defineProperty(global, 'localStorage', { value: new OnMemoryStorage()});

class Foo extends chomex.Model {
    foo() {
        return 'this is foo!';
    }
}

class Bar  extends chomex.Model {}
Bar.template = {name:'', age: 20};
class Ham  extends chomex.Model {}

class Toto extends chomex.Model {
    static schema = {
        title:       chomex.Model.Types.string.isRequired,
        description: chomex.Model.Types.string,
    }
}
class User extends chomex.Model {
    static schema = {
        name:  chomex.Model.Types.string.isRequired,
        age:   chomex.Model.Types.number.isRequired,
        langs: chomex.Model.Types.array.isRequired,
    }
}

class Game extends chomex.Model {
    static schema = {
        size: chomex.Model.Types.shape({
            width:  chomex.Model.Types.number.isRequired,
            height: chomex.Model.Types.number,
        }).isRequired,
        offset: chomex.Model.Types.shape({
            left: chomex.Model.Types.number,
            top:  chomex.Model.Types.number,
        })
    }
}

describe('Model', () => {
    it('should have customized method', () => {
        let foo = new Foo();
        foo.foo().should.equal('this is foo!');
    });
    describe('all', () => {
        it('should return all saved models', () => {
            let foo = new Foo({});
            foo.save();
            let all = Foo.all();
            Object.keys(all).length.should.equal(1);
            Object.keys(all)[0].should.equal(String(foo._id));
            all[foo._id]._id.should.equal(String(foo._id));
        });
    });
    describe('list', () => {
        it('should return all saved models but as a array', () => {
            Foo.new({}).save();
            expect(Foo.list()).to.be.an.instanceof(Array);
        });
    });
    describe('save', () => {
        it('should generate _id', () => {
            let foo = new Foo();
            expect(foo._id).be.undefined;
            foo.save();
            foo._id.should.not.be.undefined;
        });
    });
    describe('update', () => {
        it('should update properties of this (as a short hand for `save`)', () => {
            let foo = Foo.create({name: 'otiai10'});
            let bar = Foo.find(foo._id);
            bar.name.should.equal('otiai10');
            bar.update({name: 'otiai20'}).should.instanceof(chomex.Model);
            let baz = Foo.find(foo._id);
            baz.name.should.equal('otiai20');
        });
        describe('when given parameter is not a dictionary', () => {
            it('should return false', () => {
                let foo = Foo.create({name: 'otiai10'});
                let bar = Foo.find(foo._id);
                bar.update('name', 'otiai30').should.equal(false);
                bar.errors.length.should.equal(1);
            });
        });
        describe('even when template is defined', () => {
            it('should update only given fields', () => {
                class FooBar extends chomex.Model {
                    static template = {
                        xxx: {yyy: 1000},
                        zzz: true,
                    }
                }
                let foobar = FooBar.create();
                foobar.xxx.yyy.should.equal(1000);
                foobar.zzz.should.equal(true);
                foobar.update({zzz:false});
                let x = FooBar.find(foobar._id);
                x.zzz.should.equal(false);
                x.xxx.yyy.should.equal(1000);
                x.update({xxx:{yyy:2000}});
                let z = FooBar.find(foobar._id);
                z.zzz.should.equal(false);
                x.xxx.yyy.should.equal(2000);
            });
        });
    });
    describe('delete', () => {
        it('should delete data from storage', () => {
            let foo = new Foo({}, 'foo');
            foo.save();
            expect(foo._id).not.to.be.undefined;
            foo.delete().should.equal(true);
            let bar = Foo.find('foo');
            expect(bar).to.be.undefined;
        });
    });
    describe('create', () => {
        it('should construct and `save` instance with properties', () => {
            let foo = Foo.create({name:'otiai40'});
            foo._id.should.not.be.undefined;
            let baz = Foo.find(foo._id);
            baz.name.should.not.be.undefined;
            baz.name.should.equal(foo.name);
        });
        describe('when given no any arguments', () => {
            it('should create model with template or empty object', () => {
                class Spamy extends chomex.Model {}
                const spamy = Spamy.create();
                expect(spamy).not.to.be.undefined;
                expect(spamy._id).not.to.be.undefined;
                class Hammy extends chomex.Model {
                    static template = { name: 'Mr. Anonymous' };
                    static nextID = chomex.Model.sequentialID;
                }
                const hammy = Hammy.create();
                expect(hammy).not.to.be.undefined;
                expect(hammy._id).not.to.be.undefined;
                hammy.name.should.equal('Mr. Anonymous');
            });
        });
    });
    describe('filter', () => {
        it('should return filtered models', () => {
            [0,1,2,3,4,5,6,7,8,9].map(i => {
                let foo = new Foo({seq:i}, `foo-${i}`);
                foo.save();
            });
            Foo.filter(foo => foo.seq % 2 == 0).length.should.equal(5);
            Foo.filter(foo => foo.seq % 3 == 0).length.should.equal(4);
            Foo.filter(foo => foo.seq % 5 == 0).length.should.equal(2);
            let foo = Foo.filter(foo => foo.seq % 2 == 0).pop();
            foo.constructor.name.should.equal('Foo');
        });
    });
    describe('drop', () => {
        it('should remove everything from this namespace', () => {
            [10,11,12,13,14,15,16].map(i => {
                let foo = new Foo({seq:i}, `foo-${i}`);
                foo.save();
            });
            Foo.filter(() => true).length.should.not.equal(0);
            Foo.drop();
            Foo.filter(() => true).length.should.equal(0);
        });
    });
    describe('new', () => {
        it('should be an alias for constructor expression', () => {
            let bar = Bar.new();
            expect(bar).to.be.an.instanceof(Bar);
            expect(bar._id).to.be.undefined;
            expect(bar.name).to.not.be.undefined;
            bar.name.should.equal('');
            expect(bar.age).to.not.be.undefined;
            bar.age.should.equal(20);
            expect(bar.save()._id).to.not.be.undefined;
        });
    });
    describe('static nextID', () => {
        it('should generate next ID by current timestamp in default', () => {
            const now = Date.now();
            expect(chomex.Model.nextID()).to.be.within(now - 10, now + 10);
        });
        it('should be called when new model is saved', () => {
            const now = Date.now();
            let foo = new Foo();
            foo.save();
            expect(foo._id).to.be.within(now - 100, now + 100);
        });
        it('should be customized by setting function, like serial id', () => {
            const nextID = (all) => {
                return Object.keys(all).length;
            };
            Foo.nextID = nextID;
            let foo = Foo.create({});
            foo._id.should.equal(1);
            let bar = Foo.create({});
            bar._id.should.equal(2);
        });
        it('should be replaced by prepared functions: e.g. `sequentialID`', () => {
            class Spam extends chomex.Model {
                static nextID = chomex.Model.sequentialID
            }
            let foo = Spam.create({});
            foo._id.should.equal(1);
            let bar = Spam.create({});
            bar._id.should.equal(2);
            foo.delete();
            let baz = Spam.create({});
            baz._id.should.equal(3);
            let hoge = Spam.create({});
            hoge._id.should.equal(4);
            let fuga = Spam.create({});
            fuga._id.should.equal(5);
        });
        describe('when invalid `nextID` is set', () => {
            it('should be failed over with `timestampID`', () => {
                const now = Date.now();
                Ham.nextID = 'not-function';
                let foo = Ham.create({});
                expect(foo._id).to.be.within(now - 100, now + 100);
            });
        });
    });
    describe('template', () => {
        it('should provide a way to preset props', () => {
            class Foo extends chomex.Model {
                static template = {
                    name: 'templated',
                    age:  10,
                }
            }
            let foo = Foo.new();
            foo.name.should.equal('templated');
            foo.age.should.equal(10);
            expect(foo._id).to.be.undefined;
        });
        describe('when one of template is function', () => {
            it('should provide templated value with executing that function', () => {
                class Foo extends chomex.Model {
                    static template = {
                        name: `generated-${Date.now()}`,
                        age:  Math.floor(Math.random() * 29) + 1
                    }
                }
                let foo = Foo.new();
                foo.name.should.match(/generated-[0-9]+/);
                foo.age.should.within(1, 30);
                expect(foo._id).to.be.undefined;
            });
        });
    });
    describe('schema', () => {
        // TODO: write more cases
        it('should validate props', () => {
            let foo = Toto.new({
                description: 'this is description',
            });
            return new Promise((ok, ng) => {
                try {
                    foo.save();
                    ng('saving without title SHOULD throw error, but it was successful');
                } catch(err) {
                    err.should.equal('title is marked as required');
                    ok();
                }
            });
        });
        describe('for basic primitives which are able to be stored in localStorage', () => {
            let foo = User.new({
                name: 'otiai10',
                age: '21',
                langs: ['go', 'javascript', 'swift']
            });
            return new Promise((ok, ng) => {
                try {
                    foo.save();
                    ng('saving without title SHOULD throw error, but it was successful');
                } catch(err) {
                    err.should.equal('age is not number');
                    ok();
                }
            });
        });
        describe('shape', () => {
            describe('when required shape is missing', () => {
                let foo = Game.new({
                    offset: {}
                });
                return new Promise((ok, ng) => {
                    try {
                        foo.save();
                        ng('saving without title SHOULD throw error, but it was successful');
                    } catch(err) {
                        err.should.equal('size is marked as required');
                        ok();
                    }
                });
            });
            describe('when required shape is given but not satisfied', () => {
                let foo = Game.new({
                    size:   {},
                    offset: {},
                });
                return new Promise((ok, ng) => {
                    try {
                        foo.save();
                        ng('saving without title SHOULD throw error, but it was successful');
                    } catch(err) {
                        err.should.equal('width is marked as required');
                        ok();
                    }
                });
            });
            describe('when required shape is given but not satisfied', () => {
                let foo = Game.new({
                    size:   {width:200, height:100},
                    offset: {},
                });
                return new Promise((ok, ng) => {
                    try {
                        foo.save();
                        ok();
                    } catch(err) {
                        ng('satisfied model should be saved');
                    }
                });
            });
            describe('when required shapes are given but invalid fields passed', () => {
                let foo = Game.new({
                    size:   {width:200, height:100},
                    offset: {left: 'string string'},
                });
                return new Promise((ok, ng) => {
                    try {
                        foo.save();
                        ng('saving without title SHOULD throw error, but it was successful');
                    } catch(err) {
                        err.should.equal('left is not number');
                        ok();
                    }
                });
            });
        });
    });
    describe('useStorage', () => {
        it('should replace localStorage', () => {
            let storage = new OnMemoryStorage({Hoge: {1: {name:'otiai10'}}});
            chomex.Model.useStorage(storage);
            class Hoge extends chomex.Model {}
            Hoge.find(1).name.should.equal('otiai10');
            chomex.Model.useStorage(global.localStorage);
            expect(Hoge.find(1)).to.be.undefined;
        });
        it('should raise error if given storage doesn\'t satisfy Storage interface', () => {
            return Promise.all([
                new Promise((ok, ng) => {
                    let storage = {};
                    try {
                        chomex.Model.useStorage(storage);
                        ng('invalid assignment to storage SHOULD RAISE ERROR');
                    } catch(err) {
                        err.should.equal('`getItem` of Storage interface is missing');
                        ok();
                    }
                }),
                new Promise((ok, ng) => {
                    let storage = {getItem: () => {}, setItem: () => {}, removeItem: () => {}};
                    try {
                        chomex.Model.useStorage(storage);
                        ng('invalid assignment to storage SHOULD RAISE ERROR');
                    } catch(err) {
                        err.should.equal('`getItem` of Storage must accept at least 1 argument');
                        ok();
                    }
                }),
            ]);
        });
    });
});
