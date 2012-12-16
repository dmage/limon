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
                signal = req.query.signal,
                begin = req.query.begin,
                end = req.query.end,
                callback = req.query.callback;
            var stmt = db.prepare("SELECT object, signal, timestamp, value FROM data WHERE object = ? AND signal = ? AND ? <= timestamp AND timestamp < ?");
            var result = [];
            stmt.each(object, signal, begin, end, function(err, row) {
                //res.write('object: [' + row.object + '], signal: [' + row.signal + '], timestamp: [' + row.timestamp + '], value: [' + row.value + ']\n');
                result.push({ timestamp: row.timestamp, value: row.value });
            }, function() {
                if (callback) { res.end(callback + '(' + JSON.stringify(result) + ')') }
                else { res.end(JSON.stringify(result)); }
            });
        } else if (/^\/chart(\?|$)/.test(req.url)) {
            var object = req.query.object,
                signal = req.query.signal;
            var BEMHTML = require('./public/_limon.bemhtml.js').BEMHTML;
            var BEMJSON = require('./json2bemjson/limon.xjst.js').apply;
            res.end(BEMHTML.apply(BEMJSON.apply({
                mode: "need-b-chart",
                object: object,
                signal: signal
            })));
        } else if (/^\/(\?|$)/.test(req.url)) {
            var BEMHTML = require('./public/_limon.bemhtml.js').BEMHTML;
            var BEMJSON = require('./json2bemjson/limon.xjst.js').apply;

            var stmt = db.prepare("SELECT object, signal FROM data GROUP BY object, signal");
            var result = [];
            stmt.each(function(err, row) {
                result.push({
                    tag: 'li',
                    content: [
                        {
                            tag: 'a', 
                            attrs: { href: "/chart?object=" + row.object + "&signal=" + row.signal },
                            content: row.object + ": " + row.signal
                        }
                    ]
                });
            }, function() {
                res.end(BEMHTML.apply(BEMJSON.apply({
                    mode: "need-b-page",
                    content: {
                        tag: 'ul',
                        content: result
                    }
                })));
            });
        } else {
            next();
        }
    }
}
