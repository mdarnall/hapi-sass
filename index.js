var Hoek = require('hapi').utils,
    Error = require('hapi').error,
    sass = require('node-sass'),
    fs = require('fs'),
    url = require('url'),
    dirname = require('path').dirname,
    mkdirp = require('mkdirp'),
    join = require('path').join;

var internals = {

        defaults: {
            src: './lib/sass'

        },

        error: function (reply, err) {

            if(err.code == 'ENOENT'){
                return reply(Error.notFound());
            }
            else{
                return reply(err);
            }

        },

        /**
         * Log a message.
         *
         * @api private
         */

        log: function log(key, val) {
            console.error('  \033[90m%s :\033[0m \033[36m%s\033[0m', key, val);
        },

        checkImports : function(imports, path, fn){

            var nodes = imports[path];

            if (!nodes) { return fn(); }
            if (!nodes.length) { return fn(); }

            var pending = nodes.length,
                changed = [];

            nodes.forEach(function(imported){
                fs.stat(imported.path, function(err, stat){
                    // error or newer mtime
                    if (err || !imported.mtime || stat.mtime > imported.mtime) {
                        changed.push(imported.path);
                    }
                    --pending || fn(changed);
                });
            });

        }
    },
    log = internals.log,
    imports = {};


module.exports = {
    name: 'hapi-sass',
    version: '0.0.1',
    register: function (plugin, options, next) {

        var settings = Hoek.applyToDefaults(internals.defaults, options);


        // Force compilation
        var force = settings.force;

        // Debug option
        var debug = settings.debug;

        // Source dir required
        var src = settings.src;
        if (!src) {
            next(new Error('hapi-sass requires "src" directory'));
        }

        // Default dest dir to source
        var dest = settings.dest ? settings.dest : src;

        plugin.route({
            method: 'GET',
            // todo: configuration based path
            path: '/css/{file}.css',
            handler: function (request, reply) {


                // todo: sass fileextension configurable? (.sass)
                var path = request.path,
                    cssPath = join(dest, request.params.file + '.css'),
                    sassPath = join(src, request.params.file + '.scss'),
                    sassDir = dirname(sassPath);

                if (debug) {
                    console.log('source: ' + sassPath);
                    console.log('dest: ' + cssPath);
                    console.log('sassDir: ' + sassDir)
                }

                var compile = function () {

                    if (debug) {
                        log('read', cssPath);
                    }

                    fs.readFile(sassPath, 'utf8', function (err, str) {

                        if (err) {
                            return internals.error(reply, err);
                        }

                        sass.render(str, function (err, css) {
                            if (err) {
                                return internals.error(reply, err);
                            }
                            if (debug) { log('render', sassPath); }


                            mkdirp(dirname(cssPath), 0700, function(err){
                                if(err) { return reply(err); }
                                fs.writeFile(cssPath, css, 'utf8', function(err){

                                    // todo: cache?
                                    reply(css).type('text/css');

                                });
                            });

                        }, {

                            include_paths: [sassDir].concat(settings.include_paths || []),
                            image_path: settings.image_path || settings.imagePath,
                            output_style: settings.output_style || settings.outputStyle

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
                                if (debug) { log('not found, compiling', cssPath); }
                                compile();

                            } else {
                                internals.error(reply, err);
                            }
                        }
                        else { // compiled version exists, check mtimes

                            if (sassStats.mtime > cssStats.mtime){ // the sass version is newer
                                if(debug){ log('minified', cssPath); }
                                compile();
                            }
                            else {
                                // serve
                                reply.file(cssPath);
                            }

                        }
                    });
                })

            }
        });

        next();
    }
}