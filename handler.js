exports = module.exports = function() {
    var databaseFactory = require(config.database.module);
    var db = databaseFactory(config.database.config);

    return function handler(req, res, next) {
        if (/^\/api\/write(\?|$)/.test(req.url)) {
            var key = req.query.key,
                value = req.query.value;
            db.serialize(function() {
                var stmt = db.prepare("INSERT INTO data (key, timestamp, value) VALUES (?, ?, ?)");
                stmt.run(key, Math.floor(new Date()/1000), value);
            });
            res.end('key: [' + key + '], value: [' + value + ']\n');
        } else {
            next();
        }
    }
}
