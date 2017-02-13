'use strict'

let sass = require('node-sass');

module.exports = {
    'headings($from: 0, $to: 6)': function(from, to) {
        var i, f = from.getValue(), t = to.getValue(),
            list = new sass.types.List(t - f + 1);

        for (i = f; i <= t; i++) {
            list.setValue(i - f, new sass.types.String('h' + i));
        }

        return list;
    }
}