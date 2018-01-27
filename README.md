Overview
========

This homework is for you to show off your skills, both UI and
algorithmically. We provide little to no HTML/CSS so that you can choose
whatever works best for you. Also please refrain from using any libraries available to make the exercise even more fun.

Problem
=======

The goal of this project is to display a set of network nodes on the
browser. This problem will be broken down into multiple parts so that
they are easy to understand. You are also not required to finish all of
the parts, but keep in mind that we want to get a good idea of your
ability to manipulate the UI and code. Feel free to mix and match
what you want to implement.

### Part a
Display the set of nodes in a table.

### Part b
Similar to part a, but ensure that it can support large number of nodes
and the UI does not block/freeze/pause when loading the nodes. We will
likely test this with around 30,000 to 50,000 nodes.

### Part c
UI to sort the nodes by name, in both descending and ascending order.

### Part d
Given two nodes, find the path that connects those two nodes. That is,
given the following node connections (detailed of format below):

```
{
  node1: {
    node2: 3,
    node3: 10,
    node4: 12
  },
  node4: {
    node1: 12,
    node10: 2
  }
}
```

The path from `node1` to `node10` is `node1 -> node4 -> node10`.

### Part e
Similar to part d, but find the path with minimum weight. So if we add
more nodes to the previous example:

```json
{
  node1: {
    node2: 3,
    node3: 10,
    node4: 12
  },
  node2: {
    node5: 1
  },
  node4: {
    node1: 12,
    node10: 20
  },
  node5: {
    node10: 4
  }
}
```

Although the original path `node1 -> node4 -> node10` still exists, but
we see that there's one that has a lower weight,
`node1 -> node2 -> node5 -> node10`.


Documentation
=============

```
nodes = generateNodes(count, seed)
```

#### `count`
The number of nodes to be generated. The default value is 10,000 and
this is what we test with.

#### `seed`
This value is optional. It is used for debugging purposes in that if you
specify the same seed, you should expect to get the same results each
time. However, this is affected by the `count` parameter. That is:

```js
// these should match
generateNodes(10, 123) == generateNodes(10, 123)

// but these won't
generateNodes(4, 123) != generateNodes(10, 123)
```

#### returns
The output of the `generateNodes` function is a map of nodes and their
edges. Here's what `generateNodes(3)` would generate:

```
{
  "node0": {
    "node1": 58,
    "node2": 84
  },
  "node2": {
    "node1": 46,
    "node0": 84
  },
  "node1": {
    "node2": 46,
    "node0": 58
  }
}
```

In this generated node list, we see that `node0` is connected to `node1`
and the weight of this network hop is `58`. If you look at the entry for
`node1` and you'll see a corresponding `node0` with the same weight.

In other words, for every node entry in the object, it contains the list
of nodes that it's connected to and its connection weight.

