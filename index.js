var Boom = require('boom'),
  sass = require('node-sass'),
  Hoek = require('hoek'),
  fs = require('fs'),
  dirname = require('path').dirname,
  mkdirp = require('mkdirp'),
  join = require('path').join;

var internals = {

    defaults: {
        /* https://github.com/sass/node-sass#options */
        debug: false,
        force: false,
        src: './lib/sass',
        dest: './public/css',
        routePath: '/css/{file}.css',
        outputStyle: 'compressed',
        sourceComments: 'none',
        srcExtension: 'scss'
    },

    error: function (reply, err) {
        if (err.code == 'ENOENT') {
            return reply(Boom.notFound());
        }
        else {
            return reply(Boom.internal(err));
        }
    },

    log: function log(key, val) {
        console.error(' hapi-sass:  \033[90m%s :\033[0m \033[36m%s\033[0m', key, val);
    }
};

exports.register = function (server, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options);
    // Force compilation
    var force = settings.force;

    // Debug option
    var debug = settings.debug;

    // Source dir required
    var src = settings.src;
    if (!src) {
        next(new Boom('hapi-sass requires "src" directory'));
    }

    // Default dest dir to source
    var dest = settings.dest ? settings.dest : src;

    server.route({
        method: 'GET',
        path: settings.routePath,
        handler: function (request, reply) {

            var cssPath = join(dest, request.params.file + '.css'),
              sassPath = join(src, request.params.file + '.' + settings.srcExtension ),
              sassDir = dirname(sassPath);

            if (debug) {
                internals.log('source ', sassPath);
                internals.log('dest ', cssPath);
                internals.log('sassDir ', sassDir);
            }

            var compile = function () {

                if (debug) {
                    internals.log('read', sassPath);
                }

                sass.render({
                    file: sassPath,
                    includePaths: [sassDir].concat(settings.includePaths || []),
                    imagePath: settings.imagePath,
                    outputStyle: settings.outputStyle,
                    sourceComments: settings.sourceComments
                }, function(err, result){

                    if(err){
                        return internals.error(reply, err);
                    }

                    if (debug) {
                        internals.log('render', 'compilation ok');
                    }

                    mkdirp(dirname(cssPath), 0x1c0, function (err) {
                        if (err) {
                            return reply(err);
                        }
                        fs.writeFile(cssPath, result.css, 'utf8', function (err) {
                            reply(result.css).type('text/css');
                        });
                    });
                });
            };

            if (force) {
                return compile();
            }


            fs.stat(sassPath, function (err, sassStats) {

                if (err) {
                    return internals.error(reply, err);
                }
                fs.stat(cssPath, function (err, cssStats) {

                    if (err) {
                        if (err.code == 'ENOENT') {
                            // css has not been compiled
                            if (debug) {
                                internals.log('not found, compiling', cssPath);
                            }
                            compile();

                        } else {
                            internals.error(reply, err);
                        }
                    }
                    else { // compiled version exists, check mtimes

                        if (sassStats.mtime.getTime() > cssStats.mtime.getTime()) { // the sass version is newer
                            if (debug) {
                                internals.log('minified', cssPath);
                            }
                            compile();
                        }
                        else {
                            // serve
                            reply.file(cssPath);
                        }

                    }
                });
            });

        }
    });

    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
