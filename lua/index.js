var fs = require('fs');
var path = require('path');

function loadScript(name) {
  return fs.readFileSync(path.join(__dirname, name + '.lua'), 'utf8');
}

var head = loadScript('_head') + '\n';

var commands = ['tinsert', 'tchildren', 'tparent', 'tancestors', 'tdel'].map(function (command) {
  return {
    name: command,
    lua: head + loadScript(command)
  };
});

module.exports = commands;
