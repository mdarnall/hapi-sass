var HapiSass = require('../index');
var Inert = require('inert');
var expect = require('chai').expect;
var Hapi = require('hapi');

describe('Hapi-Sass', () => {

    describe('register', () => {

        it('creates a route for the plugin', async () => {
            const server = new Hapi.Server();
            var err = await server.register([Inert, {
                plugin: HapiSass,
                options: {}
            }]);
            expect(err).to.not.exist;
            await server.start();
            var tables = server.table();
            expect(tables.length).to.be.greaterThan(0);
            var route = tables[0].path;
            expect(route).to.exist;
            expect(route).to.equal('/css/{file}.css');
        });
    });

});
