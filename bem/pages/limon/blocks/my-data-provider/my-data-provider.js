/** @requires BEM */

(function() {

BEM.decl('my-data-provider', {

    get : function(xbegin, xend) {
        var data = this.data || {},
            xData = [],
            yData,
            c = 0;

        console.time('get');
        for (var x in data) {
            x = parseInt(x);
            if (xbegin <= x && x <= xend) {
                xData[c++] = x;
            }
        }

        yData = new Array(c);
        for (var i = 0; i < c; ++i) {
            yData[i] = data[xData[i]];
        }
        console.timeEnd('get');

        return {
            x: xData,
            y: yData
        };
    },

    range : function(begin, end) {
        var _this = this,
            data = this.data || (this.data = {});

        $.ajax({
            url: 'http://dmage.ru:3000/api/read?callback=?',
            dataType: 'jsonp',
            data: {
                object: _this.params.object,
                signal: _this.params.signal,
                begin: begin,
                end: end,
                aggregate: _this.params.aggregate || 0
            },
            success: function(response) {
                console.time('fetch');
                var result = response;//response.result;
                for (var i = 0, l = result.length; i < l; ++i) {
                    var r = result[i];
                    data["" + r.timestamp] = r.value * (_this.params.multiplier || 1);
                }
                console.timeEnd('fetch');
                _this.trigger('update');
            }
        });
        /*
        $.jsonRPC.request("item.intervalHistory", {
            params: {
                'itemid': _this.params.itemid,
                'from': Math.floor(begin),
                'to': Math.ceil(end)
            },
            success: function(response) {
                console.time('fetch');
                var result = response.result;
                for (var i = 0, l = result.length; i < l; ++i) {
                    var r = result[i];
                    data["" + r.timestamp] = r.value;
                }
                console.timeEnd('fetch');
                _this.trigger('update');
            }
        });
        */
    },

    sin : Math.sin,

    cos : Math.cos,

    sin2 : function(x) {
        return Math.pow(Math.sin(x), 2);
    },

    cos2 : function(x) {
        return Math.pow(Math.cos(x), 2);
    }

});

})();
