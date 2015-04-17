## Synopsis

APICarto Zoneville est un service qui permet à partir d'une adresse de déterminer le zonage particulier. Les zones supportées sont les ZFU (source IGN) et Quartiers Prioritaires (source Ministère de la ville).

## Installation

### Installation application


```bash
$ git clone 
$ cd apicarto-zoneville
(Debian)
# apt install postgresql-9.3 postgresql-9.3-postgis-2.1

$ npm install
```

### Création de la base de données

```bash
#su - postgres -c createdb zoneville
#su - postgres -c psql zoneville 
psql > create extension postgis;
$ cd data
$ wget http://www.ville.gouv.fr/squelettes/carto/assets/qp-politiquedelaville-shp.zip
$ unzip -x 
$ shp2pgsql -I -W LATIN1 -d -s 4326 QP_POLITIQUEVILLE.shp politiqueville qp|psql zoneville
```

### Launch it

```bash
$ cd ..
$ node .
```

## API Reference

Serveur publique : 
http://apicarto.coremaps.com


### GET /zoneville/api/beta/zfu

Paramètres

* adresse : L'adresse qui sera géocodée par BANO


exemple : 
curl http://apicarto.coremaps.com/zoneville/api/beta/zfu?adresse=rue%20du%20grand%20chemin,roubaix


### GET /zoneville/api/beta/qp

Paramètres :

* x (obligatoire) : coordonnées X d'un point (en wgs84)

* y (obligatoire) : coordonnées Y d'un point (en wgs84)

## Tests

:TODO

## ROADMAP


- [ ] Ajouter les ZRR
- [ ] Unifier les paramètres d'API
- [ ] Tester toutes les zones et retourner
- [ ] Unifier les réponses de l'API

## Contributors

Nabil Servais (SGMAP)

## License

MIT
