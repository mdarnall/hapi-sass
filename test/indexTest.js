var HapiSass = require('../index');
var expect = require('chai').expect;
var Hoek = require('hapi').utils;
var sinon = require('sinon');
var Hapi = require('hapi');

describe('Hapi-Sass', function(){


    describe('hapi.js plugin interface', function(){

        it('contains a name', function () {
            expect(HapiSass).to.have.property('name');
        });
        it('contains a version that matches the package.json', function(){
            expect(HapiSass).to.have.property('version', Hoek.loadPackage().version);
        });
        it('contains a register function', function(){
            expect(HapiSass).to.have.property('register')
        });

    });

    describe('register', function(){

        it('creates a route for the plugin', function(done){

            var pack = new Hapi.Pack();
            pack.server();
            pack.register(HapiSass, {}, function(err){
                var routes = pack._servers[0]._router.routes['get'];
                expect(routes[0].path).to.equal('/css/{file}.css');
                done();

            });
        });
    });

});