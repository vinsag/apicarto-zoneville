var WKT = require('terraformer-wkt-parser');
var Wreck = require('wreck');
var proj4 = require('proj4');
var config = require('config');

function zfu_intersect(coord){
      coord = proj4('EPSG:4326','EPSG:3857',datajson.features[0].geometry.coordinates),
      console.log(coord);
      point = datajson.features[0].geometry;
      point.coordinates = coord;
      console.log(point);
      point_wkt = WKT.convert(point);
      ign_wfs = config.WFS.server + config.WFS.ignkey + config.WFS.url +"/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=ZFU_BDD_WLD_WM_20150319:zfu_pm&outputFormat=json&SRSName=EPSG:4326&cql_filter=INTERSECTS(the_geom,"+ point_wkt +")";
      Wreck.get(ign_wfs, function (err, res, payload){
        if (err){
          reply({result:"error"}).code(500).header('access-control-allow-origin', '*');
        }
        datajson = JSON.parse(payload);
        
        if (datajson.features.length > 0){
          return {result:true, information:datajson.features[0].properties};
        }
        else {
          return {result:false};
        }
      })
  return 
}


exports.zfu = function(request, reply) {
  console.log(request.query);
  adresse = request.query.adresse;
  if ({adresse == null){
    bano_url = 'http://api-adresse.data.gouv.fr/search/?q='+adresse;
    Wreck.get(bano_url, function (err, res, payload){
      console.log(payload);
      datajson = JSON.parse(payload);
      if (datajson.features.length > 0) {
        result = zfu_intersect(datajson.features[0].geometry.coordinates);
        reply(result).header('access-control-allow-origin', '*');
      }
    })
  }
  else {
    result = zfu_intersect(datajson.features[0].geometry.coordinates);
    reply(result).header('access-control-allow-origin', '*');    
  }
}