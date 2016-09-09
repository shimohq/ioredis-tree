# ioredis-tree
A robust tree structure implementation for Redis

[![Build Status](https://travis-ci.org/shimohq/ioredis-tree.svg?branch=master)](https://travis-ci.org/shimohq/ioredis-tree)
[![Dependency Status](https://david-dm.org/shimohq/ioredis-tree.svg)](https://david-dm.org/shimohq/ioredis-tree)

## Install

```shell
npm install ioredis-tree
```

## Usage

```javascript
var Redis = require('ioredis');
var redis = require('ioredis-tree')(new Redis());

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

A node can have multiple parents, say we insert `4` into `5`:

```javascript
redis.tinsert('mytree', '5', '4');
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
+--+--+
   |
+--+--+
|  4  |
+-----+
```

It's not allowed to move a node into its posterity, which will lead an error:

```javascript
redis.tinsert('mytree', '3', '1');
// ERR parent node cannot be the posterity of new node
```

### TPARENTS key node

Get the parents of the node. Returns an empty array when doesn't have parent.

```javascript
redis.tparent('mytree', '5'); // ['2']
redis.tparent('mytree', '1'); // []
redis.tparent('mytree', '4'); // ['5', '1']
redis.tparent('non-exists tree', '1'); // []
redis.tparent('mytree', 'non-exists node'); // []
```

The order of parents is random.

### TPATH key from to

Get the path between `from` and `to`. The depth of `from` must lower than `to`. Return `null` if `from` isn't a ancestor of `to`.

```javascript
redis.tpath('mytree', '1', '5'); // ['2']
redis.tpath('mytree', '1', '3'); // []
redis.tpath('mytree', '1', '7'); // null
```

If there's more than one path between the two nodes, the shorter path will be returned:

```javascript
redis.tpath('mytree', '1', '4'); // []
```

### TCHILDREN key node

Get the children of the node. Each node has at least two properties:

1. `node`: The node itself.
2. `hasChild`: `true` or `false`, whether the node has at least one child.

If the `hasChild` is `true`, there will be an additional `children` property, which is an array containing the children of the node.


```javascript
redis.tchildren('mytree', '1');
// [
//   { node: '2', hasChild: true, children: [{ node: '5', hasChild: false }] },
//   { node: '3', hasChild: false },
//   { node: '4', hasChild: false }
// ]
redis.tchildren('mytree', '5'); // []
redis.tchildren('non-exists tree', '1'); // []
redis.tchildren('mytree', 'non-exists node'); // []
```

`TCHILDREN` accepts a `LEVEL` option to specified how many levels of children to fetch:

```javascript
redis.tchildren('mytree', '1', { level: 1 });
// [
//   { node: '2', hasChild: true },
//   { node: '3', hasChild: false },
//   { node: '4', hasChild: false }
// ]
```

Notice that although node '2' has a child (its `hasChild` is `true`), it doesn't has the `children` property since we are only insterested in the first level children by specifying `{ level: 1 }`.

### TREM key parent count node

Remove the reference of a node from a parent.

```javascript
redis.trem('mytree', '5', 0, '4');
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

The `count` argument influences the operation in the following ways:

* count > 0: Remove nodes moving from head to tail.
* count < 0: Remove nodes moving from tail to head.
* count = 0: Remove all nodes.

`TREM` returns the remaining nodes in the parent.

### TMREM key node

Remove the node from all parents. Use `not` option to exclude a parent.

```javascript
redis.tmrem('mytree', '2', { not: '3' });
```

### TDESTROY key node

Destroy a node recursively and remove all references of it. Returns the count of nodes being deleted.

```javascript
redis.tdestroy('mytree', '2'); // returns 2, since "2" and "5" are deleted.
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

### TMOVECHILDREN key sourceNode targetNode [APPEND|PREPEND]

Move all the children of the `sourceNode` to `targetNode`. By default the new nodes will be
appended to the target node, if `PREPEND` option is passed, the new nodes will be prepended
to the target node.

```javascript
redis.tmovechildren('mytree', 'source', 'target', 'PREPEND');
```

### TEXISTS key node

Returns if node exists.

```javascript
redis.texists('mytree', '2'); // 0
redis.texists('mytree', '1'); // 1
```

### TRENAME key node name

Rename a node.

```javascript
redis.trename('mytree', '2', '5');
```

Creates:

```
        +-----+
        |  1  |
   +----+--+--+----+
   |               |
+--+--+         +--+--+
|  5  |         |  4  |
+-----+         +-----+
```


### TPRUNE key node

Prune a tree to remove its children from parents which don't belong to the node.

Given the following two trees:

```
        +-----+
        |  1  |
   +----+--+--+----+
   |               |
+--+--+         +--+--+
|  5  |         |  4  |
+-----+         +-----+

        +-----+
        |  6  |
   +----+--+--+
   |
+--+--+
|  5  |
+-----+
```

```javascript
redis.tprune('mytree', '1');
```

Creates:

```
        +-----+
        |  1  |
   +----+--+--+----+
   |               |
+--+--+         +--+--+
|  5  |         |  4  |
+-----+         +-----+

        +-----+
        |  6  |
        +--+--+
```

## Cluster Compatibility

This module supports Redis Cluster by ensuring all nodes that are belong to a tree have a same slot.

## Performance

Benefiting from the high performance of Redis, modifying a tree is very fast. For instance, getting all children of a tree with the level of 100 recursively in a iMac 5k costs 4ms.
