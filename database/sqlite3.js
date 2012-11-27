exports = module.exports = function sqlite3(config) {
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database(config[0]);
    return db;
}
