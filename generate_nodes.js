var DEFAULT_SEED = undefined;
var DEFAULT_NUMBER_OF_NODES = 10000;
var MAX_EDGES_PER_NODE = 10;
var MAX_EDGE_WEIGHT = 100;
var MAX_ATTEMPTS_AT_GENERATING_NODES = 20;

function generateNodes(count, seed) {
  count = count || DEFAULT_NUMBER_OF_NODES;
  if (count < 1) {
    count = DEFAULT_NUMBER_OF_NODES;
  }

  var PREFIX = 'node';
  var rng = new MersenneTwister(seed || DEFAULT_SEED);
  var nodes = {};

  // Implements the Fisher-Yates shuffle. I'm doing a custom shuffle
  // implementation here so that I can rely on the random number generator.
  // This provides a mechanism for the user to specify a seed and get
  // the same shuffle each time. This is destructive.
  function shuffleArray(arr) {
    var i = -1,
        length = arr.length,
        lastIndex = length - 1;

    while (++i < length) {
      // get a number between i (inclusive) and length (exclusive)
      var rand = (rng.genrand_int31() % (length - i)) + i,
          val = arr[rand];

      // swap the i'th position with a random number from i to end of array
      arr[rand] = arr[i];
      arr[i] = val;
    }

    return arr;
  }

  // So that it's random
  var temp = shuffleArray(_.range(count));
  for (var i = 0; i < count; i++) {
    var currentNode = PREFIX + temp[i];
    nodes[currentNode] = {};
  }

  for (var i = 0; i < count; i++) {
    var currentNode = PREFIX + i;

    for (var j = 0; j < MAX_EDGES_PER_NODE; j++) {
      var attempts = 0;
      if (rng.random() < 0.25) {
        var weight = (rng.genrand_int31() % MAX_EDGE_WEIGHT) + 1;
        var other = i;
        while (other == i && attempts++ < MAX_ATTEMPTS_AT_GENERATING_NODES) {
          var next = rng.genrand_int31() % count;
          if (_.keys(nodes[PREFIX + next]).length < MAX_EDGES_PER_NODE &&
              _.isUndefined(nodes[currentNode][PREFIX + next]) &&
              currentNode !== PREFIX + next) {
            other = next;
          }
        }

        if (currentNode !== PREFIX + other) {
          var otherNode = PREFIX + other;
          var newWeight = {};
          newWeight[otherNode] = weight;
          var newWeightReverse = {};
          newWeightReverse[currentNode] = weight;

          _.extend(nodes[currentNode], newWeight);
          _.extend(nodes[otherNode], newWeightReverse);
        }
      }
    }
  }

  return nodes;
}
