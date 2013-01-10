var State = require('./state');

exports = module.exports = function(object, signal, timestamp, value, conn) {
    var v = 'last_value.' + signal;

    var s = new State(object, conn);
    var state = {};
    state[v] = value;
    s.set(state);
}
