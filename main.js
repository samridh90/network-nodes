// sort icon classes
const DEFAULT_SORT = 'icon-sort';
const SORTED_ASC = `${DEFAULT_SORT}-asc`;
const SORTED_DESC = `${DEFAULT_SORT}-desc`;

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
    setupFormHandlers(nodes);
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
  const keyAIdx = parseInt(nodeKeyA.slice(4), 10), keyBIdx = parseInt(nodeKeyB.slice(4), 10);
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
  const result = _.keys(connections).reduce((intermediate, connection) => {
    return `${intermediate}<span class="btn btn-sm">${connection}</span>`;
  }, '');
  return $(`<tr><td><span class="btn btn-sm">${node}</span></td><td>${result}</td></tr>`);
}

/* shortest path related functions */
function setupFormHandlers(nodes) {
  const $nodeA = $('#node-a');
  const $nodeB = $('#node-b');
  const $anyPathBtn = $('#any-path');
  const $result = $('#result');

  const isInputValid = (nodeA, nodeB) => {
    $result.empty();
    if (!_.isEmpty(nodeA) && !_.isEmpty(nodeB)) {
      return true;
    }
    $result.text('Enter a valid value for both, Node A and Node B');
    return false;
  }

  $anyPathBtn.click((event) => {
    const nodeA = $nodeA.val();
    const nodeB = $nodeB.val();
    if (isInputValid(nodeA, nodeB)) {
      const path = anyPath(nodes, nodeA, nodeB);
      if (path.length > 0) {
        $result.html(path.join(' &rarr; '));
      } else {
        $result.text(`Did not find a path from ${nodeA} to ${nodeB}`);
      }
    }
  });
}


function anyPath(nodes, nodeA, nodeB) {
  // BFS
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
  while (node !== ROOT) {
    path.unshift(node);
    node = visited.get(node);
  }
  return path;
}