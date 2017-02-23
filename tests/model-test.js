jest.unmock('../src/Model');

// TODO: move this mock to mock file
var localStorageMock = (function() {
    var store = {};
    return {
        getItem: function(key) {
            return store[key];
        },
        setItem: function(key, value) {
            store[key] = value.toString();
        },
        removeItem: function(key) {
            delete store[key];
        },
        clear: function() {
            store = {};
        }
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import chomex from '../src/chomex';

class Foo extends chomex.Model {
    foo() {
        return 'this is foo!';
    }
}

class Bar  extends chomex.Model {}
Bar.template = {name:'', age: 20};
class Spam extends chomex.Model {}
class Ham  extends chomex.Model {}

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
            Object.keys(all)[0].should.equal(foo._id);
            all[foo._id]._id.should.equal(foo._id);
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
            bar.update({name: 'otiai20'}).should.equal(true);
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
            Spam.nextID = chomex.Model.sequentialID;
            let foo = Spam.create({});
            foo._id.should.equal(1);
            let bar = Spam.create({});
            bar._id.should.equal(2);
            foo.delete();
            let baz = Spam.create({});
            baz._id.should.equal(3);
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
});
