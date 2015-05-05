var ZFU = require('./handlers/zfu');
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
{method: 'GET',
path: '/zoneville/api/beta/zfu',
handler: ZFU.zfu
},
{method: 'GET',
path: '/zoneville/api/beta/zrr/mapservice',
handler: function (request, reply) {
        reply.file('data/zrr.json').header('access-control-allow-origin', '*');
      }
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
    }];

