var execute = require('./utils').execute,
    State = require('./state');

exports = module.exports = function(object, signal, timestamp, value, conn) {
    var v = 'notify_if_changed.' + signal;

    var s = new State(object, conn);
    s.get([v]).then(function(state) {
        var lastValue = state[v];
        if (lastValue != value) {
            console.log("ALERTING!!", object, signal, timestamp, value);
            execute('./alert.sh', ["Signal " + signal + " changed value: [" + lastValue + "] -> [" + value + "]"]);
        }

        var state = {};
        state[v] = value;
        s.set(state).then(function() {
            console.log('state updated');
        }, function(e) {
            console.log('ERROR', e);
        });
    });
}
