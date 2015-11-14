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

`TINSERT` supports three optional options to specified where to insert the node into:

* `INDEX`: Insert the node to the specified index. Index starts with `0`, and it can also be negative numbers indicating offsets starting at the end of the list. For example, `-1` is the last element of the list, `-2` the penultimate, and so on. If the index is out of the range, the node will insert into the tail (when positive) or head (when negative).
* `BEFORE`: Insert the node before the specified node. Insert to the head when the specified is not found.
* `AFTER`: Insert the node after the specified node. Insert to the tail when the specified is not found.

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
redis.tinsert('mytree', '3', '5', { index: 1000 });
```

Creates:

```
        +-----+
        |  1  |
   +----+--+--+----+
   |       |       |
+--+--+ +--+--+ +--+--+
|  2  | |  3  | |  4  |
+-----+ +--+--+ +-----+
           |
        +--+--+
        |  5  |
        +-----+
```
