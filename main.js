$(document).ready(() => {
  // TESTING: Try changing these
  const count = 50000;
  const seed = 1234567;

  // Put the actual node generation on the event loop to load page ASAP
  setTimeout(() => {
    const nodes = generateNodes(count, seed);
    renderNodes(nodes);
  });
});

function renderNodes(nodes) {
  const $tbody = $("#table-body");
  // { a: {b: 1, c: 2}, d: {e: 1}, ...} => [[a, {b: 1, c: 2}], [d, {e: 1}], ...]
  const nodeValuePairs = _.toPairs(nodes);
  // TESTING: Try changing this. 200 seemed reasonable at the time
  const chunkSize = 200;
  // [[], [], [], [], [], []...] => [[[], [], []], [[], [], []], ...]
  const chunks = _.chunk(nodeValuePairs, chunkSize);
  renderChunkedNodes(chunks, chunkSize, (rows) => $tbody.append(rows));
}

function renderChunkedNodes(chunks, chunkSize, appendToBody) {
  const totalChunks = _.size(chunks);
  let currentChunk = 0;

  const renderChunk = (chunk) => {
    let rows = _.map(chunk, createRow);
    appendToBody(rows);
  };

  renderChunk(chunks[currentChunk]);
  $(document).scroll(_.debounce((event) => {
    const { scrollHeight, scrollTop, clientHeight } = event.target.documentElement;
    if (shouldRenderNextChunk(scrollHeight, scrollTop, clientHeight)
        && currentChunk < totalChunks) {
      renderChunk(chunks[++currentChunk]);
    }
  }, 20));
}

/*
  scrollHeight: Total scrollable screen height in px
  scrollTop: How much we've already scrolled from the top in px
  clientHeight: How much of the screen the user can see in px
*/
function shouldRenderNextChunk(scrollHeight, scrollTop, clientHeight) {
  // leftToScroll: How much is left to scroll before we hit the bottom in px
  const leftToScroll = scrollHeight - scrollTop - clientHeight;
  // threshold: 30 % of the total scrollable height...If we're within this much, load the next chunk
  const threshold = 0.3 * scrollHeight;
  return leftToScroll >= 0 && leftToScroll <= threshold;
}

function createRow([node, connections]) {
  const result = _.keys(connections).join(' ');
  return $(`<tr><td>${node}</td><td>${result}</td></tr>`);
}