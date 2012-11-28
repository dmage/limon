exports = module.exports = function init(argv, config) {
    var databaseFactory = require(config.database.module);
    var db = databaseFactory(config.database.config);

    db.run("CREATE TABLE data (id INTEGER PRIMARY KEY AUTOINCREMENT, object VARCHAR(255), signal VARCHAR(255), timestamp INTEGER, value DOUBLE)");
}
