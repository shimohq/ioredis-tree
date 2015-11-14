'use strict';

GLOBAL.Promise = require('bluebird');

if (process.env.NODE_ENV !== 'test') {
  throw new Error('expect NODE_ENV to be "test"');
}

var chai = require('chai');
GLOBAL.expect = chai.expect;

var Redis = require('ioredis');
GLOBAL.redis = new Redis();
require('../../')(redis);


beforeEach(function () {
  return redis.flushall();
});
