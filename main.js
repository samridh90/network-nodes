// sort icon classes
const DEFAULT_SORT = 'icon-sort';
const SORTED_ASC = `${DEFAULT_SORT}-asc`;
const SORTED_DESC = `${DEFAULT_SORT}-desc`;

$(document).ready(() => {
  // TESTING: Try changing these
  const count = 10000;
  const seed = 1234567;
  // Put the actual node generation on the event loop to load page ASAP
  setTimeout(() => {
    const nodes = generateNodes(count, seed);
    // { a: {b: 1, c: 2}, d: {e: 1}, ...} => [a, d, ...]
    const nodeKeys = _.keys(nodes);

    renderNodes(nodeKeys, nodes);
    handleNodeSort(nodeKeys, nodes);
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
  const result = _.keys(connections).join(' ');
  return $(`<tr><td>${node}</td><td>${result}</td></tr>`);
}
