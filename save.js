exports = module.exports = function(object, signal, timestamp, value, conn) {
    conn.getId('signals', { object: object, name: signal }, function(err, signalId) {
        if (err) {
            return;
        }

        console.log('object: [', object, '], signal: [', signal, '], id: [', signalId, ']');

        var sql = "INSERT INTO data (signal_id, timestamp, value) VALUES (?, ?, ?)";
        var bound_values = [signalId, timestamp, value];
        conn.query(sql, bound_values, function(err, result) {
            if (err) {
                console.log(err);
                return;
            }
        });
    });
}
