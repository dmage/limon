var spawn = require('child_process').spawn;

exports.execute = function execute(program, args) {
    var proc = spawn(program, args),
        out = "",
        err = "",
        callbacks = {
            eachLine: [],
            exit: [],
        };

    var interaction = {
        eachLine: function(callback) {
            callbacks.eachLine.push(callback);
            return this;
        },
        exit: function(callback) {
            callbacks.exit.push(callback);
            return this;
        }
    };

    proc.stdout.on('data', function(data) {
        out += data;
    });

    proc.stderr.on('data', function(data) {
        err += data;
    });

    proc.on('exit', function(code) {
        var lines = out.split(/\r?\n/);
        if (lines[lines.length - 1] === "") {
            lines.pop();
        }

        for (var i = 0; i < lines.length; ++i) {
            callbacks.eachLine.forEach(function(callback) {
                callback(lines[i]);
            });
        }

        callbacks.exit.forEach(function(callback) {
            callback(code);
        });
    });

    return interaction;
}
