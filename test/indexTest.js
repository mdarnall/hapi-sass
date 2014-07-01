var HapiSass = require('../index');
var expect = require('chai').expect;
var Hapi = require('hapi');

describe('Hapi-Sass', function(){

    describe('register', function(){

        it('creates a route for the plugin', function(done){
            var server = new Hapi.Server();
            server.pack.register({
                  plugin: HapiSass,
                  options: {}
              }, function (err) {
                  var routes = server.table();
                  expect(routes[0].path).to.equal('/css/{file}.css');
                  done();
              }
            );
        });
    });

});