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

exports.prototype.getId = function getId(table, values, callback) {
    var _this = this;

    var columns = [];
    var placeholders = [];
    var boundValues = [];
    for (var i in values) {
        columns.push(mysql.escapeId(i));
        placeholders.push('?');
        boundValues.push(values[i]);
    }

    var id;

    var whereSql = columns.map(function(x) { return x + " = ?" }).join(" AND ");
    var selectSql = "SELECT id FROM " + mysql.escapeId(table) + " WHERE " + whereSql + " LIMIT 1";
    this.each(selectSql, boundValues, function(row) {
        id = row.id;
    }, function() {
        if (id) {
            return callback(null, id);
        }

        var insertSql = "INSERT INTO " + mysql.escapeId(table) + " (" + columns.join(", ") + ") VALUES (" + placeholders.join(", ") + ")";
        _this.query(insertSql, boundValues, function(err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result.insertId);
        });
    });
}
