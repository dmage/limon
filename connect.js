exports = module.exports = function pipeline(argv, config, configFile) {
    var connect = require('connect');

    var app = connect();
    config.pipeline.forEach(function(p) {
        var component = p.component;
        var middlewareConfig = p.config || [];

        var middleware = require(component).apply(this, middlewareConfig);
        app.use(middleware);
    });
    app.listen(config.listen);

    process.stdout.write('Started application ' + configFile + ' (listen: ' + config.listen + ")\n");
}
