var commands = require('./lua');

function RedisTree(redis) {
  commands.forEach(function (command) {
    redis.defineCommand(command.name, {
      numberOfKeys: 1,
      lua: command.lua
    });
  });
}

// redis.tchildren('dir', id, level);
// redis.tchildren('dir', 'ROOT', user, level);

// redis.tancestors('dir', id);
// redis.tparent('dir', id);

// redis.tinsert('dir', 'ROOT', user, insertedId);
// redis.tinsert('dir', id, insertedId);
// redis.tinsert('dir', id, insertedId, 'INDEX', '-1');
// redis.tinsert('dir', id, insertedId, 'BEFORE', pivot);
// redis.tinsert('dir', id, insertedId, 'AFTER', pivot);

// redis.tdel('dir', 'ROOT', user);
// redis.tdel('dir', id);

// redis.tmove('dir', id, id, 'INDEX', '-1');

// // [LIST] tree::root:2 [1, 2, 3]
// // [LIST] tree::1 [4, 5]
// // [LIST] tree::4 [7]
// // [LIST] tree::2 [6]

// // [STR] tree::1::parent tree::ROOT:2
// // [STR] tree::2::parent tree
// // [STR] tree::3 tree
// // [STR] tree::4 tree:1
// // [STR] tree::5 tree:1
// // [STR] tree::6 tree:2
// // [STR] tree::7 tree:4

module.exports = RedisTree;
