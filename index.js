'use strict'

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

    error: function (h, err) {
        if (err.code == 'ENOENT') {
            return Boom.notFound();
        } else {
            return Boom.internal(err);
        }
    },

    log: function () {
        var args = Array.prototype.slice.call(arguments);
        args[0] = '[hapi-sass] ' + args[0];
        console.log.apply(console, args)
    }
};

exports.plugin = {
    register: (server, options) => {

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
            config: {
                files: {
                    relativeTo: './'
                }
            },
            handler: function (request, h) {

                var cssPath = join(dest, request.params.file + '.css'),
                    sassPath = join(src, request.params.file + '.' + settings.srcExtension),
                    sassDir = dirname(sassPath);

                if (debug) {
                    internals.log("Processing Request with values: %j", {
                        "sassPath": sassPath,
                        "dest": dest,
                        "sassDir": sassDir
                    })
                }

                var compile = function () {

                    if (debug) {
                        internals.log('Compiling Sass at %s', sassPath);
                    }

                    sass.render({
                        file: sassPath,
                        includePaths: [sassDir].concat(settings.includePaths || []),
                        imagePath: settings.imagePath,
                        outputStyle: settings.outputStyle,
                        functions: settings.functions,
                        sourceComments: settings.sourceComments
                    }, function (err, result) {

                        if (err) {
                            if (debug) {
                                let message = err.formatted ? err.formatted : err.message;
                                internals.log('Compilation failed: %s', message);
                            }
                            return internals.error(h, err);
                        }

                        if (debug) {
                            internals.log('Compilation ok');
                        }

                        mkdirp(dirname(cssPath), 0x1c0, function (err) {
                            if (err) {
                                return err;
                            }
                            fs.writeFile(cssPath, result.css, 'utf8', function (err) {

                                if (err && debug) {
                                    internals.log("Error writing file - %s", err.message);
                                }
                                h.response(result.css).type('text/css');
                            });
                        });
                    });
                };

                if (force) {
                    return compile();
                }

                fs.stat(sassPath, function (err, sassStats) {
                    if (err) {
                        return internals.error(h, err);
                    }
                    fs.stat(cssPath, function (err, cssStats) {

                        if (err) {
                            if (err.code == 'ENOENT') {
                                // css has not been compiled
                                if (debug) {
                                    internals.log('Compiled file not found, compiling %s', cssPath);
                                }
                                compile();

                            } else {
                                internals.error(h, err);
                            }
                        } else { // compiled version exists, check mtimes

                            if (sassStats.mtime.getTime() > cssStats.mtime.getTime()) { // the sass version is newer
                                if (debug) {
                                    internals.log('Sass file is newer, compiling %s', cssPath);
                                }
                                compile();
                            } else {
                                // serve
                                if (debug) {
                                    internals.log('Compiled file found and up to date. Serving');
                                }
                                h.file(cssPath);
                            }
                        }
                    });
                });
            }
        });
    },
    multiple: true,
    dependencies: 'inert',
    name: 'hapi-sass',
    pkg: require('./package.json'),
    version: require('./package.json').version
};
