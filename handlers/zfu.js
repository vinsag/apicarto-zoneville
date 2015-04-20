var WKT = require('terraformer-wkt-parser');
var Wreck = require('wreck');
var proj4 = require('proj4');
var config = require('config');
var Q = require('q');

function zfu_intersect(coord){
  var deferred = Q.defer();
  coord_repro = proj4('EPSG:4326','EPSG:3857',coord);
  point_wkt = WKT.convert({"type":"Point","coordinates":coord_repro});
  ign_wfs = config.WFS.server + config.WFS.ignkey + config.WFS.url +"/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=ZFU_BDD_WLD_WM_20150319:zfu_pm&outputFormat=json&SRSName=EPSG:4326&cql_filter=INTERSECTS(the_geom,"+ point_wkt +")";
  Wreck.get(ign_wfs, function (err, res, payload){
    if (err) deferred.reject(err);
    datajson = JSON.parse(payload);
    if (datajson.features.length > 0){
      deferred.resolve({result:true, information:datajson.features[0].properties});
    }
    else {
      deferred.resolve({result:false});
    }
  })
  return deferred.promise;
}


function bano_geocode(adresse){
  var deferred = Q.defer();
  bano_url = 'http://api-adresse.data.gouv.fr/search/?q='+adresse;
  Wreck.get(bano_url, function (err, res, payload){
    if (err) deferred.reject(err);
    else {
      datajson = JSON.parse(payload);
      if (datajson.features.length > 0) {
        deferred.resolve(datajson.features[0].geometry.coordinates);
      }
    }
  })
  return deferred.promise;
}

exports.zfu = function(request, reply) {
  adresse = request.query.adresse;
  if (adresse != undefined){
    result = bano_geocode(adresse).then(zfu_intersect);
    reply(result).header('access-control-allow-origin', '*')
  }
  else {
    result = zfu_intersect([parseFloat(request.query.x), parseFloat(request.query.y)]);
    reply(result).header('access-control-allow-origin', '*');    
  }
}