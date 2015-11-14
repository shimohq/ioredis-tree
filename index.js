var commands = require('./lua');

function RedisTree(redis) {
  commands.forEach(function (command) {
    redis.defineCommand(command.name, {
      numberOfKeys: 1,
      lua: command.lua
    });
  });

  // Setup transformers
  (function (tchildren) {
    redis.tchildren = function (key, node, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = null;
      }
      var argv = [key, node];
      if (options && options.level != null) {
        argv.push('LEVEL', options.level);
      }
      return tchildren.apply(redis, argv).then(function (res) {
        if (!Array.isArray(res)) {
          return res;
        }
        return res.map(convertNode);
      }).nodeify(callback);
    };
  })(redis.tchildren);

  (function (tinsert) {
    redis.tinsert = function (key, parent, node, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = null;
      }
      var argv = [key, parent, node];
      options = options || {};
      if (options.index != null) {
        argv.push('INDEX', options.index);
      } else if (options.before != null) {
        argv.push('BEFORE', options.before);
      } else if (options.after != null) {
        argv.push('AFTER', options.after);
      } else {
        argv.push('INDEX', -1);
      }
      return tinsert.apply(redis, argv).then(function (res) {
        return res;
      }).nodeify(callback);
    };
  })(redis.tinsert);
}

function convertNode(node) {
  var ret = {
    node: node[0],
    childCount: node[1]
  };

  if (node.length > 2) {
    ret.children = [];
    for (var i = 2; i < node.length; i++) {
      ret.children.push(convertNode(node[i]));
    }
  }

  return ret;
};

// redis.tchildren('dir', id, 'LEVEL', level);
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
