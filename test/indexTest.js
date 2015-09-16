var HapiSass = require('../index');
var expect = require('chai').expect;
var Hapi = require('hapi');

describe('Hapi-Sass', function () {

    describe('register', function () {

        it('creates a route for the plugin', function (done) {
            var server = new Hapi.Server();
            server.connection();
            server.register({ register: HapiSass, options: {}}, function (err) {
                    expect(err).to.not.exist;
                    var tables = server.table();
                    expect(tables.length).to.be.greaterThan(0);
                    var routes = tables[0].table;
                    expect(routes.length).to.be.greaterThan(0);
                    expect(routes[0].path).to.equal('/css/{file}.css');
                    done();
                }
            );
        });
    });

});