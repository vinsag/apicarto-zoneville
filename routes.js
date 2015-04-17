var Zone = require('./handlers/zfu');
var Quartier = require('./handlers/quartierprioritaire');

module.exports = [{
  method: 'GET',
  path: '/zoneville/api/beta/qpprox',
  handler: Quartier.qpprox
}, {
  method: 'GET',
  path: '/zoneville/api/beta/qp',
  handler: Quartier.qp
},
{method: 'GET',
path: '/zoneville/api/beta/zfu',
handler: Zone.zfu
}];