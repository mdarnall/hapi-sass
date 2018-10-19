# hapi-sass

A Hapi.js plugin for compiling and serving Sass stylesheets using [node-sass](https://github.com/andrew/node-sass). This is a port of their express middleware to a hapi.js plugin.

### Overview

This plugin will create a single (configurable) route on the server that will respond to requests for css files.

The plugin will map the request to a sass file in the configured `src` directory. The plugin will then try to just serve an existing, compiled `.css` file in the configured `dest` directory. If the file does not exist, or is older than the sass file, it will re-compile, write the file back to disk and respond with the contents back to the requestor.


### Example usage:

```shell
$ npm install hapi-sass --save
```

```javascript
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
  outputStyle: "nested",
  sourceComments: true,
  functions: require("./functions"),
  srcExtension: "sass"
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
```

See the `example/` folder for more.

### Options:

* `debug`: used to print statements to the console. Defaults to `false`
* `force`: forces re-compilation for every request. Defaults to `false`
* `src`: the directory to find the requested `.sass` file. Defaults to `./lib/sass`
* `srcExtension`: the extension of the requested `.sass` file. Defaults to `scss`
* `dest`: the destination directory to write compiled `.css` files. Defaults to `./public/css`
* `routePath`: the route to register with hapijs. Defaults to `/css/{file}.css`. The `{file}` portion of the string is currently significant. It's used as a request parameter.
* `outputStyle`: [parameter for node-sass](https://github.com/sass/node-sass#outputstyle). Defaults to `compressed`
* `sourceComments`: [parameter for node-sass](https://github.com/sass/node-sass#sourcecomments). Defaults to `false`.
* `functions`: [parameter for node-sass](https://github.com/sass/node-sass#functions--v300---experimental) to support custom functions. Defaults to an empty object.  
* `includePaths`: [parameter for node-sass](https://github.com/sass/node-sass#includepaths). Defaults to `[]`.
