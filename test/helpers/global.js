'use strict';

if (process.env.NODE_ENV !== 'test') {
  throw new Error('expect NODE_ENV to be "test"');
}

var chai = require('chai');
global.expect = chai.expect;

var Redis = require('ioredis');
global.redis = new Redis();
require('../../')(redis);


beforeEach(function () {
  return redis.flushall().then(function () {
    return Promise.all([
      redis.tinsert('tree', 'ROOT1', '1'),
      redis.tinsert('tree', 'ROOT1', '2'),
      redis.tinsert('tree', 'ROOT1', '3'),
      redis.tinsert('tree', '2', '4'),
      redis.tinsert('tree', '4', '5'),
      redis.tinsert('tree', '3', '6'),
      redis.tinsert('tree', 'ROOT2', '8'),
      redis.tinsert('tree', '8', '6'),
      redis.tinsert('tree', '8', '7')
    ]);
  });
});
