/*
 * hapi-sass
 * https://github.com/mdarnall/hapi-sass
 *
 * Copyright (c) 2014 Matt Darnall
 * Licensed under the MIT license.
 */

'use strict';

var Hapi = require('hapi');

var server = new Hapi.Server('localhost', 1337);

var options = {
    src: './sass',
    dest:'./css',
    force: true,
    debug: true,
    routePath: '/css/{file}.css',
    includePaths: ['./vendor/sass'],
    outputStyle: 'nested',
    sourceComments: 'map'
};

server.pack.register({
      plugin: require("../index.js"),
      options: options
  }
  , function(err) {
      if (err) throw err;
      server.start(function() {
          console.log("Hapi server started @ " + server.info.uri);
      });
  });