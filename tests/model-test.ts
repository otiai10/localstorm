/* tslint:disable
    max-classes-per-file
    variable-name
    no-unused-expression
    no-string-literal
    no-shadowed-variable
    no-empty
*/
jest.unmock("../src/Model");
jest.unmock("../src/Model/OnMemoryStorage");

import {Model} from "../src";
import OnMemoryStorage from "../src/Model/OnMemoryStorage";

// TODO
declare function expect(any): any;

declare var global: any;

Object.defineProperty(global, "localStorage", { value: new OnMemoryStorage()});

class Foo extends Model {
    public name: string;
    public foo() {
        return "this is foo!";
    }
}

class Bar  extends Model {
    public name: string;
    public age: number;
}
Bar.template = {name: "", age: 20};
class Ham  extends Model {}

class Toto extends Model {
    public static schema = {
        description: Model.Types.string,
        title:       Model.Types.string.isRequired,
    };
}
class User extends Model {
    public static schema = {
        age:   Model.Types.number.isRequired,
        langs: Model.Types.array.isRequired,
        name:  Model.Types.string.isRequired,
    };
}

class Game extends Model {
    public static schema = {
        offset: Model.Types.shape({
            left: Model.Types.number,
            top: Model.Types.number,
        }),
        size: Model.Types.shape({
            height: Model.Types.number,
            width: Model.Types.number.isRequired,
        }).isRequired,
    };
}

class Team extends Model {
    public static schema = {
        awards: Model.Types.arrayOf(Model.Types.string),
        leader: Model.Types.reference(User),
        members: Model.Types.arrayOf(Model.Types.reference(User)),
        name: Model.Types.string,
    };
    protected static __ns = "organization";
    public awards: string[];
    public leader: User;
    public members: User[];
    public name: string;
}

describe("Model", () => {
    it("should have customized method", () => {
        const foo = new Foo();
        foo.foo().should.equal("this is foo!");
    });
    describe("all", () => {
        it("should return all saved models", () => {
            const foo = new Foo({});
            foo.save();
            const all = Foo.all();
            Object.keys(all).length.should.equal(1);
            Object.keys(all)[0].should.equal(String(foo._id));
            all[foo._id]._id.should.equal(String(foo._id));
        });
        describe("if the schema has `reference` to other models", () => {
            it("should decode the property as the specified model instance", () => {
                const leader = User.create({ name: "otiai1000", age: 33, langs: ["ja"] });
                const user_1 = User.create({ name: "otiai1001", age: 32, langs: ["go"] });
                const user_2 = User.create({ name: "otiai1002", age: 64, langs: ["python"] });
                const team = new Team({
                    awards: ["Academy", "Global Gold"],
                    leader,
                    members: [user_1, user_2],
                    name: "A great team",
                });
                team.save();
                const found: Team = Team.find<Team>(team._id);
                expect(found).not.to.be.undefined;
                found.awards[0].should.be.an.instanceof(String);
            });
        });
    });
    describe("list", () => {
        it("should return all saved models but as a array", () => {
            Foo.new({}).save();
            expect(Foo.list()).to.be.an.instanceof(Array);
        });
    });
    describe("save", () => {
        it("should generate _id", () => {
            const foo = new Foo();
            expect(foo._id).be.undefined;
            foo.save();
            foo._id.should.not.be.undefined;
        });
        describe("if the model has __ns property", () => {
            it("should save the model under the given __ns inside Storage", () => {
                const team = new Team();
                expect(team._id).to.be.undefined;
                team.save();
                team._id.should.not.be.undefined;
                expect(Team.__storage.getItem("Team")).to.be.null;
                expect(Team.__storage.getItem("organization")).not.to.be.null;
            });
        });
    });
    describe("update", () => {
        it("should update properties of this (as a short hand for `save`)", () => {
            const foo = Foo.create({name: "otiai10"});
            const bar: Foo = Foo.find(foo._id);
            bar.name.should.equal("otiai10");
            bar.update({name: "otiai20"}).should.instanceof(Model);
            const baz: Foo = Foo.find(foo._id);
            baz.name.should.equal("otiai20");
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
        describe("even when template is defined", () => {
            it("should update only given fields", () => {
                class FooBar extends Model {
                    public static template = {
                        xxx: {yyy: 1000},
                        zzz: true,
                    };
                    public xxx: object;
                    public zzz: boolean;
                }
                const foobar: FooBar = FooBar.create();
                foobar.xxx["yyy"].should.equal(1000);
                foobar.zzz.should.equal(true);
                foobar.update({zzz: false});
                const x: FooBar = FooBar.find(foobar._id);
                x.zzz.should.equal(false);
                x.xxx["yyy"].should.equal(1000);
                x.update({xxx: {yyy: 2000}});
                const z: FooBar = FooBar.find(foobar._id);
                z.zzz.should.equal(false);
                x.xxx["yyy"].should.equal(2000);
            });
        });
    });
    describe("delete", () => {
        it("should delete data from storage", () => {
            const foo = new Foo({}, "foo");
            foo.save();
            expect(foo._id).not.to.be.undefined;
            foo.delete().should.equal(true);
            const bar = Foo.find("foo");
            expect(bar).to.be.undefined;
        });
    });
    describe("create", () => {
        it("should construct and `save` instance with properties", () => {
            const foo: Foo = Foo.create({name: "otiai40"});
            foo._id.should.not.be.undefined;
            const baz: Foo = Foo.find(foo._id);
            baz.name.should.not.be.undefined;
            baz.name.should.equal(foo.name);
        });
        describe("when given no any arguments", () => {
            it("should create model with template or empty object", () => {
                class Spamy extends Model {}
                const spamy = Spamy.create();
                expect(spamy).not.to.be.undefined;
                expect(spamy._id).not.to.be.undefined;
                class Hammy extends Model {
                    public static template = { name: "Mr. Anonymous" };
                    public static nextID = Model.sequentialID;
                    public name: string;
                }
                const hammy: Hammy = Hammy.create();
                expect(hammy).not.to.be.undefined;
                expect(hammy._id).not.to.be.undefined;
                hammy.name.should.equal("Mr. Anonymous");
            });
        });
    });
    describe("filter", () => {
        it("should return filtered models", () => {
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
                const foo: Foo = new Foo({seq: i}, `foo-${i}`);
                foo.save();
            });
            Foo.filter((foo) => foo.seq % 2 === 0).length.should.equal(5);
            Foo.filter((foo) => foo.seq % 3 === 0).length.should.equal(4);
            Foo.filter((foo) => foo.seq % 5 === 0).length.should.equal(2);
            const foo = Foo.filter((foo) => foo.seq % 2 === 0).pop();
            foo.constructor.name.should.equal("Foo");
        });
    });
    describe("drop", () => {
        it("should remove everything from this namespace", () => {
            [10, 11, 12, 13, 14, 15, 16].map((i) => {
                const foo = new Foo({seq: i}, `foo-${i}`);
                foo.save();
            });
            Foo.filter(() => true).length.should.not.equal(0);
            Foo.drop();
            Foo.filter(() => true).length.should.equal(0);
        });
    });
    describe("new", () => {
        it("should be an alias for constructor expression", () => {
            const bar: Bar = Bar.new();
            expect(bar).to.be.an.instanceof(Bar);
            expect(bar._id).to.be.undefined;
            expect(bar.name).to.not.be.undefined;
            bar.name.should.equal("");
            expect(bar.age).to.not.be.undefined;
            bar.age.should.equal(20);
            expect(bar.save()._id).to.not.be.undefined;
        });
    });
    describe("static nextID", () => {
        it("should generate next ID by current timestamp in default", () => {
            const now = Date.now();
            expect(Model.nextID()).to.be.within(now - 10, now + 10);
        });
        it("should be called when new model is saved", () => {
            const now = Date.now();
            const foo = new Foo();
            foo.save();
            expect(foo._id).to.be.within(now - 100, now + 100);
        });
        it("should be customized by setting function, like serial id", () => {
            const nextID = (all) => {
                return Object.keys(all).length;
            };
            Foo.nextID = nextID;
            const foo = Foo.create({});
            foo._id.should.equal(1);
            const bar = Foo.create({});
            bar._id.should.equal(2);
        });
        it("should be replaced by prepared functions: e.g. `sequentialID`", () => {
            class Spam extends Model {
                public static nextID = Model.sequentialID;
            }
            const foo = Spam.create({});
            foo._id.should.equal(1);
            const bar = Spam.create({});
            bar._id.should.equal(2);
            foo.delete();
            const baz = Spam.create({});
            baz._id.should.equal(3);
            const hoge = Spam.create({});
            hoge._id.should.equal(4);
            const fuga = Spam.create({});
            fuga._id.should.equal(5);
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
    describe("template", () => {
        it("should provide a way to preset props", () => {
            class Foo extends Model {
                public static template = {
                    age:  10,
                    name: "templated",
                };
                public age: number;
                public name: string;
            }
            const foo: Foo = Foo.new();
            foo.name.should.equal("templated");
            foo.age.should.equal(10);
            expect(foo._id).to.be.undefined;
        });
        describe("when one of template is function", () => {
            it("should provide templated value with executing that function", () => {
                class Foo extends Model {
                    public static template = {
                        age:  Math.floor(Math.random() * 29) + 1,
                        name: `generated-${Date.now()}`,
                    };
                    public age: number;
                    public name: string;
                }
                const foo: Foo = Foo.new();
                foo.name.should.match(/generated-[0-9]+/);
                foo.age.should.within(1, 30);
                expect(foo._id).to.be.undefined;
            });
        });
    });
    describe("schema", () => {
        // TODO: write more cases
        it("should validate props", () => {
            const foo = Toto.new({
                description: "this is description",
            });
            return new Promise((ok, ng) => {
                try {
                    foo.save();
                    ng("saving without title SHOULD throw error, but it was successful");
                } catch (err) {
                    err.message.should.equal("title is marked as required");
                    ok();
                }
            });
        });
        describe("for basic primitives which are able to be stored in localStorage", () => {
            const foo = User.new({
                age: "21",
                langs: ["go", "javascript", "swift"],
                name: "otiai10",
            });
            return new Promise((ok, ng) => {
                try {
                    foo.save();
                    ng("saving without title SHOULD throw error, but it was successful");
                } catch (err) {
                    err.should.equal("age is not number");
                    ok();
                }
            });
        });
        describe("shape", () => {
            describe("when required shape is missing", () => {
                const foo = Game.new({
                    offset: {},
                });
                return new Promise((ok, ng) => {
                    try {
                        foo.save();
                        ng("saving without title SHOULD throw error, but it was successful");
                    } catch (err) {
                        err.should.equal("size is marked as required");
                        ok();
                    }
                });
            });
            describe("when required shape is given but not satisfied", () => {
                const foo = Game.new({
                    offset: {},
                    size:   {},
                });
                return new Promise((ok, ng) => {
                    try {
                        foo.save();
                        ng("saving without title SHOULD throw error, but it was successful");
                    } catch (err) {
                        err.should.equal("width is marked as required");
                        ok();
                    }
                });
            });
            describe("when required shape is given but not satisfied", () => {
                const foo = Game.new({
                    offset: {},
                    size:   {width: 200, height: 100},
                });
                return new Promise((ok, ng) => {
                    try {
                        foo.save();
                        ok();
                    } catch (err) {
                        ng("satisfied model should be saved");
                    }
                });
            });
            describe("when required shapes are given but invalid fields passed", () => {
                const foo = Game.new({
                    offset: {left: "string string"},
                    size:   {width: 200, height: 100},
                });
                return new Promise((ok, ng) => {
                    try {
                        foo.save();
                        ng("saving without title SHOULD throw error, but it was successful");
                    } catch (err) {
                        err.should.equal("left is not number");
                        ok();
                    }
                });
            });
        });
    });
    describe("useStorage", () => {
        it("should replace localStorage", () => {
            const storage = new OnMemoryStorage({Hoge: {1: {name: "otiai10"}}});
            Model.useStorage(storage);
            class Hoge extends Model {
                public name: string;
            }
            Hoge.find<Hoge>(1).name.should.equal("otiai10");
            Model.useStorage(global.localStorage);
            expect(Hoge.find(1)).to.be.undefined;
        });
        it("should raise error if given storage doesn't satisfy Storage interface", () => {
            return Promise.all([
                new Promise((ok, ng) => {
                    const storage = {};
                    try {
                        Model.useStorage(storage);
                        ng("invalid assignment to storage SHOULD RAISE ERROR");
                    } catch (err) {
                        err.message.should.equal("`getItem` of Storage interface is missing");
                        ok();
                    }
                }),
                new Promise((ok, ng) => {
                    const storage = {getItem: () => {}, setItem: () => {}, removeItem: () => {}};
                    try {
                        Model.useStorage(storage);
                        ng("invalid assignment to storage SHOULD RAISE ERROR");
                    } catch (err) {
                        err.message.should.equal("`getItem` of Storage must accept at least 1 argument");
                        ok();
                    }
                }),
            ]);
        });
    });
});
