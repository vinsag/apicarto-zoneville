var WKT = require('terraformer-wkt-parser');
var Wreck = require('wreck');
var proj4 = require('proj4');
var config = require('config');
var turf = require('turf');
var Q = require('q');

function zfu_intersect(coord){
  var deferred = Q.defer();

  var coord_repro = proj4('EPSG:4326','EPSG:3857',coord.geom);
  var point = {"type":"Point","coordinates":coord_repro}
  var point_wkt = WKT.convert(point);
  var ign_wfs = config.WFS.server + config.WFS.ignkey + config.WFS.url +'/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=ZFU_BDD_WLD_WM_20150319:zfu_pm&outputFormat=json&SRSName=EPSG:4326&cql_filter=INTERSECTS(the_geom,'+ point_wkt +')';
  
  console.log(ign_wfs);

  var result = {bano_geocode:coord.bano}

  Wreck.get(ign_wfs, function (err, res, payload){
    if (err) deferred.reject(err);
      
    var datajson = JSON.parse(payload);

    if (datajson.features.length > 0){
      result.result = true;
      var properties = datajson.features[0].properties;
      var vertices = turf.explode(datajson.features[0]);
      
      var point1 = {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": coord.geom
        }
      };

      var closestVertex = turf.nearest(point1, vertices);
      var distance = turf.distance(point1, closestVertex, 'kilometers')
      result.information = {idzone:properties.numzfu,
                            commune:properties.commune,
                            codeinsee:properties.codinsee_c,
                            distance:distance,
                            other:properties.quartier}
      deferred.resolve(result);
    }
    else {
      result.result = false;
      deferred.resolve(result);
    }
  })

  return deferred.promise;
}


function bano_geocode(adresse){
  var deferred = Q.defer();
  var bano_url = 'http://api-adresse.data.gouv.fr/search/?q='+adresse;
  Wreck.get(bano_url, function (err, res, payload){
    if (err) deferred.reject(err);
    else {
      var datajson = JSON.parse(payload);
      if (datajson.features.length > 0) {
        deferred.resolve({geom:datajson.features[0].geometry.coordinates, source:"ban"});
      }
    }
  })
  return deferred.promise;
}

exports.zfu = function(request, reply) {
  var adresse = request.query.adresse;
  if (adresse !== undefined){
    var result = bano_geocode(adresse).then(zfu_intersect);
    reply(result).header('access-control-allow-origin', '*')
  }
  else {
    result = zfu_intersect({geom:[parseFloat(request.query.x), parseFloat(request.query.y)], bano:false});
    reply(result).header('access-control-allow-origin', '*');    
  }
}
