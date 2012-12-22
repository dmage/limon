exports = module.exports = function(object, signal, value, conn) {
    var sql = "INSERT INTO data (object, signal, timestamp, value) VALUES (?, ?, ?, ?)";
    var bound_values = [object, signal, Math.floor(new Date()/1000), value];
    conn.query(sql, bound_values);
}
