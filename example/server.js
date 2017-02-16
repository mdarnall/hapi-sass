/*
 * hapi-sass
 * https://github.com/mdarnall/hapi-sass
 *
 * Copyright (c) 2014 Matt Darnall
 * Licensed under the MIT license.
 */

'use strict';

var Hapi = require('hapi');
var HapiSass = require('../index');
var Inert = require('inert');

var server = new Hapi.Server();
server.connection({ port: 1337 });

let options = {
    src: './sass',
    dest: './css',
    force: true,
    debug: true,
    routePath: '/css/{file}.css',
    includePaths: ['./vendor/sass'],
    outputStyle: 'nested',
    sourceComments: true,
    functions: require('./functions'),
    srcExtension: 'scss'
};

server.register([Inert, {
        register: HapiSass,
        options: options
    }]
    , function (err) {
        if (err) throw err;
        server.start(function () {
            server.log("Hapi server started @ " + server.info.uri);
        });
    }
);
