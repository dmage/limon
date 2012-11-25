#!/usr/bin/env node
var fs = require('fs'),
    yaml = require('js-yaml');

var configFile;
if (process.argv.length != 3) {
    process.stderr.write("usage: app.js <config.yaml>\n");
    process.exit(1);
} else {
    configFile = process.argv[2];
}

config = require(configFile);

var connect = require('connect');
var app = connect();
config.pipeline.forEach(function(p) {
    var component = p.component;
    var config = p.config || [];

    var middleware = require(component).apply(this, config);
    app.use(middleware);
});
app.listen(config.listen);
process.stdout.write('Started application ' + configFile + ' (listen: ' + config.listen + ")\n");
