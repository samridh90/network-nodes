// sort icon classes
const DEFAULT_SORT = 'icon-sort';
const SORTED_ASC = `${DEFAULT_SORT}-asc`;
const SORTED_DESC = `${DEFAULT_SORT}-desc`;
const PREFIX = 'node';

/* main */
$(document).ready(() => {
  // TESTING: Try changing these
  const count = 50000;
  const seed = 1234567;
  // Put the actual node generation on the event loop to load page ASAP
  setTimeout(() => {
    const nodes = generateNodes(count, seed);
    // { a: {b: 1, c: 2}, d: {e: 1}, ...} => [a, d, ...]
    const nodeKeys = _.keys(nodes);

    renderNodes(nodeKeys, nodes);
    handleNodeSort(nodeKeys, nodes);
    setupFormHandlers(nodes, count);
  });
});


function handleNodeSort(nodeKeys, nodes) {
  const $nodeCol = $('#node-col');
  let nodeKeysClone = nodeKeys.slice(0);
  $nodeCol.click((event) => {
    const $sortIcon = $(event.target.querySelector('#sort-icon'));
    if ($sortIcon.hasClass(DEFAULT_SORT)) {
      // This will only happen the first time we sort
      nodeKeysClone.sort(nodeKeyComparator);
      // Sorting ascending this time
      $sortIcon.attr('class', SORTED_ASC);
    } else {
      // Every other time, just reverse the array
      nodeKeysClone.reverse();
      // Set the right class
      $sortIcon.attr('class', $sortIcon.hasClass(SORTED_ASC) ? SORTED_DESC : SORTED_ASC);
    }
    renderNodes(nodeKeysClone, nodes);
  });
}


function nodeKeyComparator(nodeKeyA, nodeKeyB) {
  const keyAIdx = +nodeKeyA.slice(4), keyBIdx = +nodeKeyB.slice(4);
  if (keyAIdx < keyBIdx) {
    return -1;
  } else if (keyAIdx > keyBIdx) {
    return 1;
  }
  return 0;
}


function renderNodes(nodeKeys, nodes) {
  const $tbody = $('#table-body');
  // Clear everything before proceeding to add things
  $tbody.empty();
  // TESTING: Try changing this. 200 seemed reasonable at the time
  const chunkSize = 200;
  // [a, b, c, d, e, f, ...] => [[a, b, c], [d, e, f], ...]
  const keyChunks = _.chunk(nodeKeys, chunkSize);
  renderChunkedNodes(keyChunks, nodes, (rows) => $tbody.append(rows));
}


function renderChunkedNodes(keyChunks, nodes, appendToBody) {
  const totalChunks = _.size(keyChunks);
  let currentChunk = 0;

  const renderChunk = (keyChunk) => {
    const rows = keyChunk.map((key) => createRow(key, nodes[key]));
    appendToBody(rows);
  };
  renderChunk(keyChunks[currentChunk]);

  const scrollHandler = (event) => {
    //scrollHeight: Total scrollable screen height in px
    //scrollTop: How much we've already scrolled from the top in px
    //clientHeight: How much of the screen the user can see in px
    const { scrollHeight, scrollTop, clientHeight } = event.target.documentElement;

    if (shouldRenderNextChunk(scrollHeight, scrollTop, clientHeight)
      && currentChunk < totalChunks - 1) {
      renderChunk(keyChunks[++currentChunk]);
    }
  };
  const debouncedScrollHandler = _.debounce(scrollHandler, 20);
  $(document).unbind('scroll');
  $(document).scroll(debouncedScrollHandler);
}


function shouldRenderNextChunk(scrollHeight, scrollTop, clientHeight) {
  // leftToScroll: How much is left to scroll before we hit the bottom in px
  const leftToScroll = scrollHeight - scrollTop - clientHeight;
  // threshold: 30 % of the total scrollable height...If we're within this much, load the next chunk
  const threshold = 0.3 * scrollHeight;
  return leftToScroll >= 0 && leftToScroll <= threshold;
}


function createRow(node, connections) {
  // Sort connections by distance to see closest nodes first
  const result = _(connections).toPairs().sortBy(1).reduce((res, [conn, dist]) => {
    return `${res}<span class="btn btn-sm badge m-2" data-badge="${dist}">${conn}</span>`;
  }, '');
  return $(`<tr><td><span class="btn btn-sm btn-block">${node}</span></td><td>${result}</td></tr>`);
}


/* shortest path related functions */
function setupFormHandlers(nodes, count) {
  const $nodeA = $('#node-a'), $nodeB = $('#node-b'),
        $getPathsBtn = $('#get-paths'), $result = $('#result'),
        $anyPath = $('#any-path'), $anyPathCost = $('#any-path-cost'),
        $shortestPath = $('#shortest-path'), $shortestPathCost = $('#shortest-path-cost');

  const isInputValid = (nodeA, nodeB) => {
    $result.empty();
    if (!_.isEmpty(nodeA) && !_.isEmpty(nodeB)) {
      return true;
    }
    $result.text('Enter a valid value for both, Node A and Node B');
    return false;
  }

  $getPathsBtn.click((event) => {
    const nodeA = $nodeA.val();
    const nodeB = $nodeB.val();
    if (isInputValid(nodeA, nodeB)) {
      // Don't block the click handler
      setTimeout(() => {
        const {path, cost} = anyPath(nodes, nodeA, nodeB);
        if (path.length > 0) {
          // Compute shortest only if at least one path exists
          const {path: sPath, cost: lCost} = shortestPath(nodes, count, nodeA, nodeB);

          $anyPath.html(path.join(' &rarr; '));
          $anyPathCost.html(cost);
          $shortestPath.html(sPath.join(' &rarr; '));
          $shortestPathCost.html(lCost);
        } else {
          $result.text(`Did not find a path from ${nodeA} to ${nodeB}`);
        }
      });
    }
  });
}


function anyPath(nodes, nodeA, nodeB) {
  // Breadth First Search
  const ROOT = 'root';
  let visited = new Map();
  let queue = [nodeA];
  visited.set(nodeA, ROOT);
  while (queue.length > 0) {
    const node = queue.shift();
    if (node === nodeB) {
      // Found the path
      break;
    }
    // Get all adjacent nodes
    const adjacentNodes = _.keys(nodes[node]);
    for (let adjacentNode of adjacentNodes) {
      // Add them to the queue only if they haven't been visited
      if (!visited.has(adjacentNode)) {
        visited.set(adjacentNode, node);
        queue.push(adjacentNode);
      }
    }
  }
  let node = nodeB;
  let path = [];
  let cost = 0;
  while (visited.has(node) && node !== ROOT) {
    path.unshift(node);
    const parent = visited.get(node);
    cost += nodes[parent] ? nodes[parent][node] : 0;
    node = parent;
  }
  return {path, cost};
}


function shortestPath(nodes, count, nodeA, nodeB) {
  // Dijkstra's SSSP
  // Easier to deal with ints
  const source = +nodeA.slice(4)
  const dest = +nodeB.slice(4);

  let priorityQ = new TinyQueue([], (pairA, pairB) => pairA.dist - pairB.dist);
  let dist = [];
  let prev = []

  dist[source] = 0;
  for (let v of _.range(count)) {
    if (v !== source) {
      dist[v] = Number.MAX_SAFE_INTEGER;
    }
    priorityQ.push({node: v, dist: dist[v]});
  }
  while (priorityQ.length > 0) {
    // least cost node so far
    const u = priorityQ.pop();
    if (u.node === dest) {
      break;
    }

    const edges = nodes[`${PREFIX}${u.node}`];
    const adjacentNodes = _.keys(edges);

    for (let node of adjacentNodes) {
      const v = +node.slice(4);
      const alternateDist = dist[u.node] + edges[node];

      if (alternateDist < dist[v]) {
        dist[v] = alternateDist;
        prev[v] = u.node;
        priorityQ.push({node: v, dist: alternateDist});
      }
    }
  }

  let path = [];
  let node = dest;
  while (!_.isUndefined(prev[node])) {
    path.unshift(`${PREFIX}${node}`);
    node = prev[node];
  }
  path.unshift(`${PREFIX}${node}`);
  return {path, cost: dist[dest]};
}