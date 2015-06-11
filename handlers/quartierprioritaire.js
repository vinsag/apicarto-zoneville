var turf = require('turf');
var format = require ('pg-format');

function mapservice(){
  sql = format("SELECT ST_ASgeojson(qp.geom) as geom, code_qp, nom_qp, commune_qp FROM politiqueville as qp;");
  return sql;
}

function zone(point){
  sql = format("SELECT ST_distance_Sphere(p.geom, d.geom) as distance, code_qp, nom_qp, commune_qp \
                FROM politiqueville as p,\
                  (SELECT ST_SetSRID(ST_GeomFromText('POINT(%s %s)'), 4326) geom) d\
                WHERE ST_contains(p.geom, d.geom) or ST_distance_sphere(p.geom, d.geom) < 1000 \
                ORDER BY ST_distance_sphere(p.geom, d.geom)", 
                point.long, point.lat);
  return sql
}

function contains(point){
  sql = format("SELECT code_qp, nom_qp, commune_qp \
                FROM politiqueville as p,\
                  (SELECT ST_SetSRID(ST_GeomFromText('POINT(%s %s)'), 4326) geom) d\
                WHERE ST_contains(p.geom, d.geom)", 
                point.long, point.lat);
  return sql
}
function FeatureCollection(){
  this.type = 'FeatureCollection';
  this.features = new Array();
}

exports.qp = function (request, reply) {
  point = {long:request.query.x, lat:request.query.y};
  sql = contains(point);
  request.pg.client.query(sql, function (err, result){
    if (err){
      throw err;
    };
    if (result.rows == undefined){
      return reply({status:'No Data'}).code(404).header('access-control-allow-origin', '*')
    }
    /*for (i = 0; i < result.rows.length; i++){
      ;
    }*/
    reply(result.rows)
      .header('access-control-allow-origin', '*')
  })  
}

exports.qpprox = function (request, reply) {
  console.log(request.query);
  point = {long:request.query.long, lat:request.query.lat};
  console.log('point');
  sql = zone(point);
  request.pg.client.query(sql, function (err, result){
    console.log(result);
    if (err){
      throw err;
    };
    if (result.rows == undefined){
      return reply({status:'No Data'}).code(404).header('access-control-allow-origin', '*')
    }
    /*for (i = 0; i < result.rows.length; i++){
      ;
    }*/
    reply(result.rows)
      .header('access-control-allow-origin', '*')
  })
}

exports.mapservice = function (request, reply) {
  sql = mapservice();
    request.pg.client.query(sql, function (err, result){

    if (err){
      throw err;
    };
    var featureCollection = new FeatureCollection();
    if (result.rows == undefined){
      return reply({status:'No Data'}).code(404).header('access-control-allow-origin', '*')
    }
    for (i = 0; i < result.rows.length; i++){
       featureCollection.features[i] = {type: "Feature",
        geometry:JSON.parse(result.rows[i].geom),
        properties:{code_qp:result.rows[i].code_qp,
          nom_qp:result.rows[i].nom_qp,
          commune_qp: result.rows[i].commune_qp
        }
      }
    }
    reply(featureCollection)
      .header('access-control-allow-origin', '*')
  }) 
}