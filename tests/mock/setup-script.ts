declare var global: any;

import * as chai from 'chai';
global.jestExpect = global.expect;
global.expect = chai.expect;

import * as should from 'should';
global.should = should;