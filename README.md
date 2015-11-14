# ioredis-tree
A robust tree structure implementation for Redis

## Install

```shell
npm install ioredis-tree
```

## Usage

```javascript
var Redis = require('ioredis');
var redis = new Redis();

var tree = require('ioredis-tree');
tree(redis);

redis.tinsert('files', 'parent', 'node');
```
