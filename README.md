hapi-sass
=========

A Hapi.js plugin for compiling and serving Sass stylesheets using [node-sass](https://github.com/andrew/node-sass). 

This is a port of their express middleware to a hapi.js plugin. 

Example usage:

```shell
$ npm install hapi-sass
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
      dest: './public/css'
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

This will create a route on the server at `/css/{filename}.css`. That route will then look for a `{filename}.scss` file in the configured `src` folder. If the file exists and hasn't yet be compiled it will compile it using `node-sass` and store it in the configured `dest` folder. Compile options like `outputStyle` and `sourceComments` can be configured and will be sent to `node-sass`. 


