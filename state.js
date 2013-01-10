var Q = require('q');

State = module.exports = function State(object, conn) {
    this.object = object;
    this.conn = conn;
}

State.prototype.get = function get(variables) {
    var deferred = Q.defer();

    var boundValues = [this.object];
    var placeholders = [];
    for (var i in variables) {
        var key = variables[i];
        boundValues.push(key);
        placeholders.push('?');
    }

    var state = {};
    this.conn.each(
        "SELECT variable, value FROM state WHERE object = ? AND variable IN (" + placeholders.join(',') + ")", boundValues,
        function(row) {
            state[row.variable] = row.value;
        },
        function() {
            for (var i in variables) {
                var key = variables[i];
                if (typeof state[key] == 'undefined') {
                    state[key] = null;
                }
            }

            deferred.resolve(state);
        }
    );

    return deferred.promise;
}

State.prototype._do = function _do(sql, boundValues) {
    var deferred = Q.defer();

    this.conn.query(sql, boundValues, function(err, result) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            deferred.resolve(result);
        }
    });

    return deferred.promise;
}

State.prototype.set = function set(state) {
    var promises = [];
    for (var key in state) {
        var value = state[key];
        if (value === null) {
            promises.push(this._do("DELETE FROM state WHERE object = ? AND variable = ?", [this.object, key]));
        } else {
            promises.push(this._do("INSERT INTO state (object, variable, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?", [this.object, key, value, value]));
        }
    }
    return Q.all(promises);
}
