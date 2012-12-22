exports = module.exports = function sqlite3(config) {
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database(config[0]);
    db.formatSql = exports.formatSql;
    return db;
}

exports.formatSql = function formatSql(cmd) {
    if (cmd[0] === 'create_table') {
        var props = cmd[1];
        var tableName = props.name;
        var definition = [];
        for (var i = 0; i < props.columns.length; ++i) {
            var column = props.columns[i],
                columnName = column[0],
                columnType = column[1],
                columnProps = column[2] || {};
            var sql = columnName + ' ' + columnType.toUpperCase();
            if (columnProps.primary_key) {
                sql += ' PRIMARY KEY';
            }
            if (columnProps.auto_increment) {
                sql += ' AUTOINCREMENT';
            }
            definition.push(sql);
        }
        return 'CREATE TABLE ' + tableName + ' (' +
            definition
                .map(function(x) { return "\n    " + x; })
                .join(',') +
            "\n);";
    }
}
