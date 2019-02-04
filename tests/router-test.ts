/* tslint:disable
    max-classes-per-file
    variable-name
    no-unused-expression
    no-string-literal
    no-shadowed-variable
    no-empty
*/

declare var process: any;

jest.unmock("../src/Router/Router");
import {Router} from "../src";

describe("Router", () => {
    it("should match with another keyname", () => {
        const router: any = new Router();
        let flag = 0;
        router.on("/foo/bar", () => {
            flag += 1;
        });
        router.listen({act: "/foo/bar"});
        flag.should.equal(1);
    });
    describe("resolveFunc for constructor", () => {
        it("should change resolve rule", () => {
            const count = {x: 0, y: 0};
            const resolveFunc = (message) => {
                return (message.match(/foo/)) ? {name: "xx"} : {name: "yy"};
            };
            const router: any = new Router(resolveFunc);
            router.on("xx", () => { count.x += 1; });
            router.on("yy", () => { count.y += 1; });

            router.listen("foobar");
            router.listen("foobar");
            router.listen("foobar");
            router.listen("spamham");
            router.listen("spamham");

            count.x.should.equal(3);
            count.y.should.equal(2);
        });
    });
    describe("when matched controller doesn't return anything", () => {
        it("should NOT fire `sendResponse` callback function", () => {
            const router: any = new Router();
            router.on("xx", () => { });
            const NiceController = () => { };
            router.on("yy", NiceController);
            return Promise.all([
                new Promise((resolve, reject) => {
                    router.listen({act: "xx"}, {}, () => reject("SHOULD NOT GET CALLED"));
                    process.nextTick(() => resolve());
                }),
                new Promise((resolve, reject) => {
                    router.listen({act: "yy"}, {}, () => reject("SHOULD NOT GET CALLED"));
                    process.nextTick(() => resolve());
                }),
            ]);
        });
    });
    describe("when unhandled error thrown in a controller", () => {
        it("should stringify error message and handle it as status:500", () => {
            const router: any = new Router();
            router.on("/rough", () => {
                return {}["null"]["pointer"];
            });
            return Promise.all([
                new Promise((resolve) => {
                    router.listen({act: "/rough"}, {}, (res) => {
                        res.status.should.equal(500);
                        res.message.should.equal(
                            "Unhandled Background Error: TypeError: Cannot read property 'pointer' of undefined",
                        );
                        resolve();
                    });
                }),
            ]);
        });
    });
});
