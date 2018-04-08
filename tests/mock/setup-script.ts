declare var global: any;
declare var process: any;

import * as chai from "chai";
global.jestExpect = global.expect;
global.expect = chai.expect;

import * as should from "should";
global.should = should;

process.on("unhandledRejection", (reason: any) => {
    // Do nothing
    // @see https://github.com/facebook/jest/issues/3251
});
