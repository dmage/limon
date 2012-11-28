exports = module.exports = function(object, signal, value, db) {
    db.serialize(function() {
        var stmt = db.prepare("INSERT INTO data (object, signal, timestamp, value) VALUES (?, ?, ?, ?)");
        stmt.run(object, signal, Math.floor(new Date()/1000), value);
    });
}
