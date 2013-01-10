var execute = require('./utils').execute;

exports = module.exports = function(object, signal, timestamp, value, conn) {
    var v = 'notify_if_changed.' + signal;
    var lastValue;
    conn.each(
        "SELECT value FROM state WHERE object = ? AND variable = ?", [object, v],
        function(row) {
            lastValue = row.value;
        }, function() {
            if (lastValue != value) {
                execute('./alert.sh', ["Signal " + signal + " changed value: [" + lastValue + "] -> [" + value + "]"]);
            }
            var sql = "INSERT INTO state (object, variable, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?";
            var bound_values = [object, v, value, value];
            conn.query(sql, bound_values);
        }
    );
}
