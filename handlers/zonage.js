var WKT = require('terraformer-wkt-parser');
var Wreck = require('wreck');
var proj4 = require('proj4');
var config = require('config');
var turf = require('turf');
var format = require('pg-format');
var Q = require('q');

function contains(point) {
  sql = format("SELECT ST_ASgeojson(p.geom_4326) as geom, nom_comm, insee_com, zrr, zrd, ber \
                FROM communes as p,\
                  (SELECT ST_SetSRID(ST_GeomFromText('POINT(%s %s)'), 4326) geom) d\
                WHERE ST_contains(p.geom_4326, d.geom) and (zrr=true or zrd=true or ber=true)",
    point.long, point.lat)
  return sql
}

function all() {
  sql = "SELECT ST_ASgeojson(p.geom_4326) as geom, nom_comm, insee_com, zrr, zrd, ber \
                FROM communes as p\
                WHERE (zrr=true or zrd=true or ber=true)"
  return sql
}

function FeatureCollection() {
  this.type = 'FeatureCollection';
  this.features = new Array();
}
exports.query = function(request, reply) {
  console.log(request.query);
  console.log(typeof request.query.lat)
  if (typeof request.query.lat == 'undefined') {
    sql = all();
  } else {
    point = {
      long: request.query.lng,
      lat: request.query.lat
    };
    console.log('point');
    sql = contains(point);
  }
  request.pg.client.query(sql, function(err, result) {
    if (err) {
      throw err;
    };
    if (result.rows == undefined) {
      return reply({
        status: 'No Data'
      }).code(404).header('access-control-allow-origin', '*')
    }
    /*for (i = 0; i < result.rows.length; i++){
      ;
    }*/

    if (result.rowCount == 0) {
      reply({
          status: false
        })
        .header('access-control-allow-origin', '*')
    } else {
      var featureCollection = new FeatureCollection();

      for (var i = 0; i < result.rows.length; i++) {
        featureCollection.features[i] = {
          type: "Feature",
          geometry: JSON.parse(result.rows[i].geom),
          properties: {
            insee_com: result.rows[i].insee_com,
            nom_comm: result.rows[i].nom_comm,
          }
        }
      }
      reply(featureCollection)
        .header('access-control-allow-origin', '*');
    }
  })
}
