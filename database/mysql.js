var mysql = require('mysql');

exports = module.exports = function mysqlAdapter(config) {
    this._connection = mysql.createConnection(config);
}

exports.prototype.formatSql = function formatSql(cmd) {
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
                sql += ' AUTO_INCREMENT';
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

exports.prototype.query = function query(sql, bound_values, callback) {
    this._connection.query(sql, bound_values, callback);
}

exports.prototype.each = function each(sql, bound_values, rowCallback, endCallback) {
    var query = this._connection.query(sql, bound_values);
    query
        .on('result', function(row) {
            rowCallback(row);
        })
        .on('end', endCallback);
}
