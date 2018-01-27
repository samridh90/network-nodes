$(document).ready(() => {
  let count = 50000;
  let seed = 1234567;
  nodes = generateNodes(count, seed);
  renderTable(nodes);
});

function renderTable(nodes) {
  let $container = $('.container');
  let $table = $('<table></table>');
  let $thead = $('<thead></thead>');
  let $tbody = $('<tbody></tbody>');
  let $header = $('<tr><th>Node</th><th>Edges</th></tr>');
  $container.append(
    $table
      .append($thead.append($header))
      .append($tbody)
  );
  renderNodes($tbody, nodes);
}

function renderNodes($tbody, nodes) {

}
