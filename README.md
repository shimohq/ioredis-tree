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

## API

### TINSERT key parent node

Insert `node` to `parent`. If `parent` does not exist, a new tree with root of `parent` is created.

#### Example

```javascript
redis.tinsert('mytree', '1', '2');
```

Creates:

```
        +-----+
        |  1  |
   +----+-----+
   |
+--+--+
|  2  |
+-----+
```

```javascript
redis.tinsert('mytree', '1', '3');
```

Creates:

```
        +-----+
        |  1  |
   +----+-----+----+
   |               |
+--+--+         +--+--+
|  2  |         |  3  |
+-----+         +-----+
```
