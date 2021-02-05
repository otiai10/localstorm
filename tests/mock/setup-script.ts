declare let global: any;
declare let process: any;

import * as chai from 'chai';
global.jestExpect = global.expect;
global.expect = chai.expect;
chai.should();

process.on('unhandledRejection', (reason: any) => {
  // Do nothing
  // @see https://github.com/facebook/jest/issues/3251
});
