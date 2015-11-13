var Redis = require('ioredis');
var redis = new Redis();
require('../')(redis);

// redis.tinsert('dir', 'ROOT', 16, 1, 'INDEX', 0, function (err, res) {
//   console.log(err, res);
// });

redis.tinsert('dir', 16, 1, 'INDEX', 0, function (err, res) {
  console.log(err, res);
});

redis.tchildren('dir', 'ROOT' + 16, function (err, res) {
  console.log(err, res);
});
