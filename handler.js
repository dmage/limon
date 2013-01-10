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
                    for (var k = 0; k < route.signals.length; ++k) {
                        var sig = route.signals[k];
                        var r2 = new RegExp('^' + sig.signal + '$');
                        if (r2.test(signal)) {
                            for (var j = 0; j < sig.processors.length; ++j) {
                                var processor = require(sig.processors[j]);
                                processor(object, signal, timestamp, value, db);
                            }
                            break;
                        }
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
                callback = req.query.callback,
                aggregate = +req.query.aggregate,
                aggrOffset = Math.floor(aggregate/2);
            if (aggregate) {
                begin = begin + (begin%aggregate ? (aggregate - begin%aggregate) : 0);
                end = end - end%aggregate;
            }
            var aggrF = function(result) {
                if (!aggregate) { return result; }
                var r = [];
                var v = {};
                for (var i = 0; i < result.length; ++i) {
                    var p = {
                        timestamp: result[i].timestamp - result[i].timestamp%aggregate,
                        value: result[i].value
                    };
                    if (v.timestamp != p.timestamp) {
                        if (v.count) {
                            v.value /= v.count;
                            v.timestamp += aggrOffset;
                            r.push(v);
                        }
                        v = p;
                        v.count = 1;
                    } else {
                        v.value += p.value;
                        v.count += 1;
                    }
                }
                if (v.count) {
                    v.value /= v.count;
                    v.timestamp += aggrOffset;
                    r.push(v);
                }
                return r;
            }
            var result = [];
            db.each(
                "SELECT d.timestamp, d.value FROM data d JOIN signals s ON s.id = d.signal_id WHERE s.object = ? AND s.name = ? AND ? <= d.timestamp AND d.timestamp < ? ORDER BY d.timestamp",
                [object, signal, begin, end],
                function(row) {
                    result.push({ timestamp: row.timestamp, value: row.value });
                }, function() {
                    if (callback) { res.end(callback + '(' + JSON.stringify(aggrF(result)) + ')') }
                    else { res.end(JSON.stringify(aggrF(result))); }
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
                period: req.query.period || 600,
                aggregate: req.query.aggregate || 0
            })));
        } else if (/^\/(\?|$)/.test(req.url)) {
            var BEMHTML = require('./public/_limon.bemhtml.js').BEMHTML;
            var BEMJSON = require('./json2bemjson/limon.xjst.js').apply;
            var result = [];
            db.each(
                "SELECT object, name FROM signals", [],
                function(row) {
                    result.push({
                        tag: 'li',
                        content: [
                            {
                                tag: 'span',
                                content: row.object + ": " + row.name
                            },
                            '&nbsp;',
                            {
                                tag: 'a',
                                attrs: { href: "/chart?object=" + row.object + "&signal=" + row.name + '&period=3600' },
                                content: '1h'
                            },
                            '&nbsp;',
                            {
                                tag: 'a',
                                attrs: { href: "/chart?object=" + row.object + "&signal=" + row.name + '&period=86400' },
                                content: '1d'
                            },
                            '&nbsp;',
                            {
                                tag: 'a',
                                attrs: { href: "/chart?object=" + row.object + "&signal=" + row.name + '&period=604800&aggregate=300' },
                                content: '1w'
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
        } else if (/^\/variables(\?|$)/.test(req.url)) {
            var BEMHTML = require('./public/_limon.bemhtml.js').BEMHTML;
            var BEMJSON = require('./json2bemjson/limon.xjst.js').apply;
            var result = [];
            db.each(
                "SELECT object, variable, value FROM state ORDER BY object, variable", [],
                function(row) {
                    result.push({
                        tag: 'tr',
                        content: [
                            { tag: 'td', attrs: { style: "padding-right:2em" }, content: row.object },
                            { tag: 'td', attrs: { style: "padding-right:2em" }, content: row.variable },
                            { tag: 'td', content: row.value }
                        ]
                    });
                },
                function() {
                    res.end(BEMHTML.apply(BEMJSON.apply({
                        mode: "need-b-page",
                        refresh: 10,
                        content: {
                            tag: 'table',
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
