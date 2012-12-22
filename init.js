exports = module.exports = function init(argv, config) {
    var databaseFactory = require(config.database.module);
    var db = new databaseFactory(config.database.config);

    var migration0000 = require('./migrations/0000-initial');
    for (var i = 0; i < migration0000.length; ++i) {
        var cmd = migration0000[i];
        db.query(db.formatSql(cmd), []);
    }
}
