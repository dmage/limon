exports = module.exports = function(object, signal, timestamp, value, conn) {
    var sql = "INSERT INTO data (object, signal, timestamp, value) VALUES (?, ?, ?, ?)";
    var bound_values = [object, signal, timestamp, value];
    conn.query(sql, bound_values);
}
