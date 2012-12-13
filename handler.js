exports = module.exports = function(config) {
    var databaseFactory = require(config.database.module);
    var db = databaseFactory(config.database.config);

    return function handler(req, res, next) {
        if (/^\/api\/write(\?|$)/.test(req.url)) {
            var object = req.query.object,
                signal = req.query.signal,
                value = req.query.value;

            for (var i = 0; i < config.router.length; ++i) {
                var route = config.router[i];
                var r = new RegExp('^' + route.object + '$');
                if (r.test(object)) {
                    for (var j = 0; j < route.processors.length; ++j) {
                        var processor = require(route.processors[j]);
                        processor(object, signal, value, db);
                    }
                    break;
                }
            }

            res.end('object: [' + object + '], signal: [' + signal + '], value: [' + value + ']\n');
        } else if (/^\/api\/read(\?|$)/.test(req.url)) {
            var object = req.query.object,
                signal = req.query.signal;
            var stmt = db.prepare("SELECT object, signal, timestamp, value FROM data WHERE object = ? AND signal = ?");
            stmt.each(object, signal, function(err, row) {
                res.write('object: [' + row.object + '], signal: [' + row.signal + '], timestamp: [' + row.timestamp + '], value: [' + row.value + ']\n');
            }, function() {
                res.end();
            });
        } else {
            next();
        }
    }
}
