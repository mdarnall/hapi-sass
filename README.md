hapi-sass
=========

A Hapi.js plugin for compiling and serving Sass stylesheets using [node-sass](https://github.com/andrew/node-sass). 

This is a port of their express middleware to a hapi.js plugin. 

Example usage:

```shell
$ npm install hapi-sass
```

```javascript
var HapiSass = require('hapi-sass')

var server = new Hapi.Server(config.host, config.port, config.server)

server.pack.register(HapiSass, {

    debug: true,
    force: true,
    src: './lib/sass',
    outputStyle: 'compressed',
    sourceComments: 'normal',
    dest: './lib/public/css'

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

