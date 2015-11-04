'use strict';

var addCmd = function(whaler) {
    var pkg = require('./package.json');
    var console = whaler.require('./lib/console');

    whaler.cli.command(
        pkg.name + ' [name] [path]'
    ).description(
        pkg.description
    ).option(
        '-e, --env <ENV>',
        'Application environment'
    ).option(
        '--config <CONFIG>',
        'Config to use'
    ).action(function(name, path, options) {

        var opts = {
            name: name,
            path: path,
            env: options.env,
            config: options.config
        };

        whaler.events.emit('init', opts, function(err, app) {
            console.log('');
            if (err) {
                return console.error('[%s] %s', process.pid, err.message, '\n');
            }

            var name = whaler.helpers.getName(opts['name']);
            console.info('[%s] An application with "%s" name created.', process.pid, name, '\n');
        });

    }).on('--help', function() {
        whaler.cli.argumentsHelp(this, {
            'name': 'Application name',
            'path': 'Application path'
        });
    });
};

module.exports = function(whaler) {

    addCmd(whaler);

    whaler.events.on('init', function(options, callback) {
        options['name']   = whaler.helpers.getName(options['name']);
        options['path']   = whaler.helpers.getPath(options['path']);
        options['env']    = options['env'] || 'dev';
        options['config'] = options['config'];

        whaler.apps.add(options['name'], {
            path: options['path'],
            env:  options['env'],
            config: {}
        }, function(err, app) {
            if (err) {
                return callback(err);
            }

            whaler.events.emit('config', {
                name: options['name'],
                config: options['config'],
                update: true
            }, function(err, config) {
                if (err) {
                    whaler.apps.remove(options['name']);
                    return callback(err);
                }

                app['config'] = config;
                callback(null, app);
            });
        });
    });
};
