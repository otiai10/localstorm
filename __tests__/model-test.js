jest.unmock(       '../src/Model');

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
    clear: function() {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import chomex from '../src/chomex';

class Foo extends chomex.Model {
  foo() {
    return "this is foo!";
  }
}

describe('Model', () => {
  it('should have customized method', () => {
      let foo = new Foo();
      expect(foo.foo()).toBe("this is foo!")
  })
  describe('save', () => {
    it("should generate _id", () => {
      let foo = new Foo();
      expect(foo._id).toBe(undefined);
      foo.save();
      expect(foo._id).not.toBe(undefined);
    })
  })
  describe('delete', () => {
    it('should delete data from storage', () => {
      let foo = new Foo({}, "foo");
      foo.save();
      expect(foo._id).not.toBe(undefined);
      expect(foo.delete()).toBe(true);
      let bar = Foo.find("foo");
      expect(bar).toBe(undefined);
    })
  })
})
