hapi-sass
=========

A Hapi.js plugin for compiling and serving Sass stylesheets using [node-sass](https://github.com/andrew/node-sass). This is a port of their express middleware to a hapi.js plugin. 

### Overview

This plugin will create a single (configurable) route on the server that will respond to requests for css files. 

The plugin will map the request to a sass file in the configured `src` directory. The plugin will then try to just serve an existing, compiled `.css` file in the configured `dest` directory. If the file does not exist, or is older than the sass file, it will re-compile, write the file back to disk and respond with the contents back to the requestor. 


### Example usage:

```shell
$ npm install hapi-sass --save
```

```javascript
var server = new Hapi.Server(config.host, config.port, config.server)

server.pack.register({
    plugin: require('hapi-sass'),
    options: {
      debug: true,
      force: true,
      src: './lib/sass',
      outputStyle: 'compressed',
      sourceComments: 'normal',
      dest: './public/css',
      routePath: '/css/{file}.css'
    }
  }, function(err){
    if(err){
        console.log(err)
        return
    }

    server.route(routes)
    server.start()
    console.log('Running on port: ' + config.port);
})
```

### Options:

* `debug` : used to print statements to the console. Defaults to `false`
* `force` : forces re-compilation for every request. Defaults to `false`
* `src` : the directory to find the requested `.sass` file. Defaults to `./lib/sass`
* `dest` : the destination directory to write compiled `.css` files. Defaults to `./public/css`
* `routePath`: the route to register with hapijs. Defaults to `/css/{file}.css`. The `{file}` portion of the string is currently significant. It's used as a request parameter. 
* `outputStyle` : [parameter for node-sass](https://github.com/sass/node-sass#outputstyle). Defaults to `compressed`
* `sourceComments` : [parameter for node-sass](https://github.com/sass/node-sass#sourcecomments). Defaults to `none`.
 
