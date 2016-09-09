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

  (function (tancestors) {
    redis.tancestors = function (key, node, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = null;
      }
      var argv = [key, node];
      if (options && options.level != null) {
        argv.push('LEVEL', options.level);
      }
      return tancestors.apply(redis, argv).nodeify(callback);
    };
  })(redis.tancestors);

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
      return tinsert.apply(redis, argv).nodeify(callback);
    };
  })(redis.tinsert);

  (function (tmrem) {
    redis.tmrem = function (key, node, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = null;
      }
      var argv = [key, node];
      options = options || {};
      if (options.not != null) {
        argv.push('NOT', options.not);
      }
      return tmrem.apply(redis, argv).nodeify(callback);
    };
  })(redis.tmrem);

  return redis;
}

function convertNode(node) {
  var ret = {
    node: node[0],
    hasChild: !!node[1]
  };

  if (node.length > 2) {
    ret.children = [];
    for (var i = 2; i < node.length; i++) {
      ret.children.push(convertNode(node[i]));
    }
  }

  return ret;
};

module.exports = RedisTree;
