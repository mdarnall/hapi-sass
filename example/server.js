/*
 * hapi-sass
 * https://github.com/mdarnall/hapi-sass
 *
 * Copyright (c) 2014 Matt Darnall
 * Licensed under the MIT license.
 */

"use strict";

const Hapi = require("hapi");
const HapiSass = require("../index");
const Inert = require("inert");

const server = new Hapi.Server({ port: 3000, host: "localhost" });

const options = {
  src: "./sass",
  dest: "./css",
  force: true,
  debug: true,
  routePath: "/css/{file}.css",
  includePaths: ["./vendor/sass"],
  outputStyle: "expanded",
  sourceComments: true,
  functions: require("./functions"),
  srcExtension: "scss"
};

const init = async () => {
  await server.register([
    Inert,
    {
      plugin: HapiSass,
      options: options
    }
  ]);

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};
process.on("unhandledRejection", err => {
  console.log(err);
  process.exit(1);
});

init();
