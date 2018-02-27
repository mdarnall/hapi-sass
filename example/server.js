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

const server = new Hapi.Server();

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

const provision = async () => {
    try {
        await server.register([Inert, {
            plugin: HapiSass,
            options: options
        }]);

        await server.start();

        server.log("Hapi server started @ " + server.info.uri);
    } catch (e) {
        throw e;
    }
};

provision();
