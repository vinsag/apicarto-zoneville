var ZFU = require('./handlers/zfu');
var Zone = require('./handlers/zonage')
var Quartier = require('./handlers/quartierprioritaire');
var config = require('config')
module.exports = [{
  method: 'GET',
  path: '/zoneville/api/beta/qpprox',
  handler: Quartier.qpprox
}, {
  method: 'GET',
  path: '/zoneville/api/beta/qp',
  handler: Quartier.qp
},
{
  method: 'POST',
  path: '/zoneville/api/v1/qp',
  handler: Quartier.qp_post
},
{method: 'GET',
path: '/zoneville/api/beta/zfu',
handler: ZFU.zfu
},
{method: 'GET',
path: '/zoneville/api/beta/zrr/mapservice',
handler: Zone.query
},
{
  method: 'GET',
  path: '/zoneville/api/beta/zfu/mapservice',
  handler: {
    proxy: {
        mapUri: function (request, callback){
          console.log(request.url.search);
          callback(null, config.WFS.server + config.WFS.ignkey + config.WFS.url+ 'wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=ZFU_BDD_WLD_WM_20150319:zfu_pm&outputFormat=json&SRSName=EPSG:4326');
        },
        onResponse: function(err, res, request, reply, settings, ttl){
          reply(res).header('access-control-allow-origin', '*');
        },
        passThrough: false,
        xforward: false
      }}
},
{
  method: 'GET',
  path: '/zoneville/api/beta/qp/mapservice',
  handler: Quartier.mapservice
},
];

