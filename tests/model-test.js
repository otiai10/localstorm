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

describe('Model', () => {
    it('should have customized method', () => {
        let foo = new Foo();
        expect(foo.foo()).to.equal('this is foo!');
    });
    describe('all', () => {
        it('should return all saved models', () => {
            let foo = new Foo({});
            foo.save();
            let all = Foo.all();
            expect(Object.keys(all).length).to.equal(1);
            expect(Object.keys(all)[0]).to.equal(foo._id);
            expect(all[foo._id]._id).to.equal(foo._id);
        });
    });
    describe('save', () => {
        it('should generate _id', () => {
            let foo = new Foo();
            expect(foo._id).to.equal(undefined);
            foo.save();
            expect(foo._id).not.to.equal(undefined);
        });
    });
    describe('update', () => {
        it('should update properties of this (as a short hand for `save`)', () => {
            let foo = Foo.create({name: 'otiai10'});
            let bar = Foo.find(foo._id);
            expect(bar.name).to.equal('otiai10');
            expect(bar.update({name: 'otiai20'})).to.equal(true);
            let baz = Foo.find(foo._id);
            expect(baz.name).to.equal('otiai20');
        });
        describe('when given parameter is not a dictionary', () => {
            it('should return false', () => {
                let foo = Foo.create({name: 'otiai10'});
                let bar = Foo.find(foo._id);
                expect(bar.update('name', 'otiai30')).to.equal(false);
                expect(bar.errors.length).to.equal(1);
            });
        });
    });
    describe('delete', () => {
        it('should delete data from storage', () => {
            let foo = new Foo({}, 'foo');
            foo.save();
            expect(foo._id).not.to.equal(undefined);
            expect(foo.delete()).to.equal(true);
            let bar = Foo.find('foo');
            expect(bar).to.equal(undefined);
        });
    });
    describe('create', () => {
        it('should construct and `save` instance with properties', () => {
            let foo = Foo.create({name:'otiai40'});
            expect(foo._id).not.to.equal(undefined);
            let baz = Foo.find(foo._id);
            expect(baz.name).not.to.equal(undefined);
            expect(baz.name).to.equal(foo.name);
        });
    });
    describe('filter', () => {
        it('should return filtered models', () => {
            [0,1,2,3,4,5,6,7,8,9].map(i => {
                let foo = new Foo({seq:i}, `foo-${i}`);
                foo.save();
            });
            expect(Foo.filter(foo => foo.seq % 2 == 0).length).to.equal(5);
            expect(Foo.filter(foo => foo.seq % 3 == 0).length).to.equal(4);
            expect(Foo.filter(foo => foo.seq % 5 == 0).length).to.equal(2);
            let foo = Foo.filter(foo => foo.seq % 2 == 0).pop();
            expect(foo.constructor.name).to.equal('Foo');
        });
    });
    describe('drop', () => {
        it('should remove everything from this namespace', () => {
            [10,11,12,13,14,15,16].map(i => {
                let foo = new Foo({seq:i}, `foo-${i}`);
                foo.save();
            });
            expect(Foo.filter(() => true).length).not.to.equal(0);
            Foo.drop();
            expect(Foo.filter(() => true).length).to.equal(0);
        });
    });
});
