exports = module.exports = function(config) {
    var databaseFactory = require(config.database.module);
    var db = new databaseFactory(config.database.config);

    return function handler(req, res, next) {
        if (/^\/api\/write(\?|$)/.test(req.url)) {
            var object = req.query.object,
                signal = req.query.signal,
                timestamp = req.query.timestamp,
                value = req.query.value;

            for (var i = 0; i < config.router.length; ++i) {
                var route = config.router[i];
                var r = new RegExp('^' + route.object + '$');
                if (r.test(object)) {
                    for (var j = 0; j < route.processors.length; ++j) {
                        var processor = require(route.processors[j]);
                        processor(object, signal, timestamp, value, db);
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
            var result = [];
            db.each(
                "SELECT object, signal, timestamp, value FROM data WHERE object = ? AND signal = ? AND ? <= timestamp AND timestamp < ?",
                [object, signal, begin, end],
                function(row) {
                    result.push({ timestamp: row.timestamp, value: row.value });
                }, function() {
                    if (callback) { res.end(callback + '(' + JSON.stringify(result) + ')') }
                    else { res.end(JSON.stringify(result)); }
                }
            );
        } else if (/^\/chart(\?|$)/.test(req.url)) {
            var object = req.query.object,
                signal = req.query.signal;
            var BEMHTML = require('./public/_limon.bemhtml.js').BEMHTML;
            var BEMJSON = require('./json2bemjson/limon.xjst.js').apply;
            res.end(BEMHTML.apply(BEMJSON.apply({
                mode: "need-b-chart",
                object: object,
                signal: signal,
                period: req.query.period || 600
            })));
        } else if (/^\/(\?|$)/.test(req.url)) {
            var BEMHTML = require('./public/_limon.bemhtml.js').BEMHTML;
            var BEMJSON = require('./json2bemjson/limon.xjst.js').apply;
            var result = [];
            db.each(
                "SELECT object, signal FROM data GROUP BY object, signal", [],
                function(row) {
                    result.push({
                        tag: 'li',
                        content: [
                            {
                                tag: 'span',
                                content: row.object + ": " + row.signal
                            },
                            '&nbsp;',
                            {
                                tag: 'a',
                                attrs: { href: "/chart?object=" + row.object + "&signal=" + row.signal + '&period=3600' },
                                content: '1h'
                            },
                            '&nbsp;',
                            {
                                tag: 'a',
                                attrs: { href: "/chart?object=" + row.object + "&signal=" + row.signal + '&period=86400' },
                                content: '1d'
                            }
                        ]
                    });
                },
                function() {
                    res.end(BEMHTML.apply(BEMJSON.apply({
                        mode: "need-b-page",
                        content: {
                            tag: 'ul',
                            content: result
                        }
                    })));
                }
            );
        } else {
            next();
        }
    }
}
