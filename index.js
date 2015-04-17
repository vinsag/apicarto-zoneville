var Hapi = require('hapi');
var config = require('config');

// Create a server with a host and port
var server = new Hapi.Server();
server.connection({ 
    host: 'localhost', 
    port: 8000 
});
var plugin = {
    register: require('hapi-node-postgres'),
    options: {
        connectionString: 'postgres://'+config.dbConfig.user+ ':' + config.dbConfig.password +'@localhost/zoneville',
        native: true
    },
};

server.register(plugin, function (err) {

    if (err) {
        console.error('Failed loading "hapi-node-postgres" plugin');
    }
});
server.register({
  register: require('good'),
  options: {
    reporters: [{
      reporter: require('good-console'),
      args:[{ response: '*' }]
    }]
  }
}, function (err) {
  if (err) {
    throw err;
  }
});

// Add the route
server.route(require('./routes'));

// Start the server
server.start();