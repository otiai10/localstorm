jest.unmock('../src/chomex');
import chomex from '../src/chomex';

class Foo extends chomex.Model {
  foo() {
    return "this is foo!";
  }
}

describe('Model', () => {
  it("should foo", () => {
    let foo = new Foo();
    expect(foo.foo()).toBe("this is foo!")
  })
})
