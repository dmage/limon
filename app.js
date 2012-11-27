#!/usr/bin/env node
var fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml');

var configFile;
if (process.argv.length < 3) {
    process.stderr.write("usage: app.js <config.yaml> [application ...]\n");
    process.exit(1);
} else {
    configFile = process.argv[2];
}
var argv = process.argv.slice(3);

var configPath = path.resolve(process.cwd(), configFile);
var config = require(configPath);

if (typeof config.work_dir !== 'undefined') {
    var fakePath = path.resolve('/', config.work_dir, './index.js');
    process.mainModule.filename = fakePath;
} else {
    process.mainModule.filename = configPath;
}

var moduleName;
if (argv.length > 0) {
    moduleName = argv.shift();
} else {
    moduleName = config.main;
}
if (typeof moduleName === 'undefined') {
    process.stderr.write('app.js: no application specified');
    process.exit(1);
}

var module = require('./' + moduleName);
module(argv, config[moduleName], configFile);
