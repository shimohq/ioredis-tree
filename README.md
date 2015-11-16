# ioredis-tree
[Work In Progress] A robust tree structure implementation for Redis

[![Build Status](https://travis-ci.org/shimohq/ioredis-tree.svg?branch=master)](https://travis-ci.org/shimohq/ioredis-tree)
[![Dependency Status](https://david-dm.org/shimohq/ioredis-tree.svg)](https://david-dm.org/shimohq/ioredis-tree)

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
redis.tinsert('mytree', '1', '4');
```

Creates:

```
        +-----+
        |  1  |
   +----+-----+----+
   |               |
+--+--+         +--+--+
|  2  |         |  4  |
+-----+         +-----+
```

`TINSERT` accepts one of the three optional options to specified where to insert the node into:

1. `INDEX`: Insert the node to the specified index. Index starts with `0`, and it can also be negative numbers indicating offsets starting at the end of the list. For example, `-1` is the last element of the list, `-2` the penultimate, and so on. If the index is out of the range, the node will insert into the tail (when positive) or head (when negative).
2. `BEFORE`: Insert the node before the specified node. Insert to the head when the specified node is not found.
3. `AFTER`: Insert the node after the specified node. Insert to the tail when the specified node is not found.

Continue with our example:

```javascript
redis.tinsert('mytree', '1', '3', { before: '4' });

// Or:
// redis.tinsert('mytree', '1', '3', { after: '2' });
// redis.tinsert('mytree', '1', '3', { index: 1 });
// redis.tinsert('mytree', '1', '3', { index: -2 });
```

Creates:

```
        +-----+
        |  1  |
   +----+--+--+----+
   |       |       |
+--+--+ +--+--+ +--+--+
|  2  | |  3  | |  4  |
+-----+ +-----+ +-----+
```

```javascript
redis.tinsert('mytree', '2', '5', { index: 1000 });
```

Creates:

```
        +-----+
        |  1  |
   +----+--+--+----+
   |       |       |
+--+--+ +--+--+ +--+--+
|  2  | |  3  | |  4  |
+--+--+ +-----+ +-----+
   |
+--+--+
|  5  |
+-----+
```

It's not allowed to move a node into its posterity, which will lead an error:

```javascript
redis.tinsert('mytree', '3', '1');
// ERR parent node cannot be the posterity of new node
```

### TPARENT key node

Get the parent of the node. Returns `null` when doesn't have parent.

```javascript
redis.tparent('mytree', '5'); // '2'
redis.tparent('mytree', '1'); // null
redis.tparent('non-exists tree', '1'); // null
redis.tparent('mytree', 'non-exists node'); // null
```

### TANCESTORS key node

Get the ancestors of the node. Returns an empty arrey when doesn't have ancestors.

```javascript
redis.tancestors('mytree', '5'); // ['2', '1']
redis.tancestors('mytree', '1'); // []
redis.tancestors('non-exists tree', '1'); // []
redis.tancestors('mytree', 'non-exists node'); // []
```

`TANCESTORS` accepts a `LEVEL` option to specified how many levels of ancestors to fetch:

```javascript
redis.tancestors('mytree', '5', { level: 2 }); // ['2', '1']
redis.tancestors('mytree', '5', { level: 1 }); // ['2']
redis.tancestors('mytree', '5', { level: 0 }); // []
redis.tancestors('mytree', '5', { level: 3 }); // ['2', '1']
```

### TCHILDREN key node

Get the children of the node. Each node has at least two properties:

1. `node`: The node itself.
2. `hasChild`: `1` or `0`, whether the node has at least one child.

If the `hasChild` is `1`, there will be an additional `children` property, which is an array containing the children of the node.


```javascript
redis.tchildren('mytree', '1');
// [
//   { node: '2', hasChild: 1, children: [{ node: '5', hasChild 0 }] },
//   { node: '3', hasChild: 0 },
//   { node: '4', hasChild: 0 }
// ]
redis.tchildren('mytree', '5'); // []
redis.tchildren('non-exists tree', '1'); // []
redis.tchildren('mytree', 'non-exists node'); // []
```

`TCHILDREN` accepts a `LEVEL` option to specified how many levels of children to fetch:

```javascript
redis.tchildren('mytree', '1', { level: 1 });
// [
//   { node: '2', hasChild: 1 },
//   { node: '3', hasChild: 0 },
//   { node: '4', hasChild: 0 }
// ]
```

Notice that although node '2' has a child (its `hasChild` is `1`), it doesn't has the `children` property since we are only insterested in the first level children by specifying `{ level: 1 }`.

### TDEL key node

Delete a node recursively. Returns the number of nodes that being deleted;

```javascript
redis.tdel('mytree', '2'); // returns 2, since "2" and "5" are deleted.
```

Creates:

```
        +-----+
        |  1  |
   +----+--+--+----+
   |               |
+--+--+         +--+--+
|  3  |         |  4  |
+-----+         +-----+
```

### TEXISTS key node

Returns if node exists.

```javascript
redis.texists('mytree', '2'); // 0
redis.texists('mytree', '1'); // 1
```

## Cluster Compatibility

This module supports Redis Cluster by ensuring all nodes that are belong to a tree have a same slot.

## Performance

Benefiting from the high performance of Redis, modifying a tree is very fast. For instance, getting all children of a tree with the level of 100 recursively in a iMac 5k costs 4ms.
