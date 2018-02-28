'use strict'

var Boom = require('boom'),
    sass = require('node-sass'),
    Hoek = require('hoek'),
    fs = require('fs'),
    dirname = require('path').dirname,
    mkdirp = require('mkdirp'),
    join = require('path').join;

const {
    promisify
} = require('util');

const sassRenderAsync = promisify(sass.render);

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
            return Boom.badRequest('hapi-sass requires "src" directory');
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
            handler: async function (request, h) {
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

                var compile = async () => {
                    if (debug) {
                        internals.log('Compiling Sass at %s', sassPath);
                    }

                    var results = await sassRenderAsync({
                        file: sassPath,
                        includePaths: [sassDir].concat(settings.includePaths || []),
                        imagePath: settings.imagePath,
                        outputStyle: settings.outputStyle,
                        functions: settings.functions,
                        sourceComments: settings.sourceComments
                    });

                    let err = results.err;
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

                    let errMk = await mkdirp(dirname(cssPath), 0x1c0);
                    if (errMk) {
                        return errMk;
                    }
                    let errFs = await fs.writeFile(cssPath, results.css, 'utf8');

                    if (errFs && debug) {
                        internals.log("Error writing file - %s", errFs.message);
                    }
                    return h.response(results.css).type('text/css');
                };

                if (force) {
                    return compile();
                }

                let [errFs1, sassStats] = await fs.stat(sassPath);
                if (errFs1) {
                    return internals.error(h, errFs1);
                }
                let [errFs2, cssStats] = await fs.stat(cssPath);
                if (errFs2) {
                    if (errFs2.code == 'ENOENT') {
                        // css has not been compiled
                        if (debug) {
                            internals.log('Compiled file not found, compiling %s', cssPath);
                        }
                        compile();
                    } else {
                        internals.error(h, errFs2);
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
                        return h.file(cssPath);
                    }
                }
            }
        });
    },
    multiple: true,
    dependencies: 'inert',
    name: 'hapi-sass',
    pkg: require('./package.json'),
    version: require('./package.json').version
};
