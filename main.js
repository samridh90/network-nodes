$(document).ready(() => {
  let count = 5000;
  let seed = 1234567;
  nodes = generateNodes(count, seed);
  renderTable(nodes);
});

function renderTable(nodes) {
  let $container = $('.container');
  let $table = $('<table></table>');
  let $thead = $('<thead></thead>');
  let $tbody = $('<tbody></tbody>');
  let $header = $('<tr><th class="node-col">Node</th><th>Edges</th></tr>');
  $container.append(
    $table
      .append($thead.append($header))
      .append($tbody)
  );
  renderNodes($tbody, nodes);
}

function renderNodes($tbody, nodes) {
  let rows = _.map(_.toPairs(nodes), ([key, value]) => {
      let edges = _.keys(value).join(' ');
      return $(`<tr><td>${key}</td><td>${edges}</td></tr>`);
    });
  $tbody.append(rows);
}
