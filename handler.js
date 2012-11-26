exports = module.exports = function() {
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database('./write.db');

    db.run("CREATE TABLE data (id INTEGER PRIMARY KEY AUTOINCREMENT, key VARCHAR(255), timestamp INTEGER, value DOUBLE)", function(error) {
        // ...
    });

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
