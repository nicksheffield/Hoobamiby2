var _ = require('lodash');

var exp = { whites: [], blacks: [] };

var list = [
	'custom',
	'default',
	'first',
	'second',
	'third',
	'pax'
];

for (var i = 0; i < list.length; i++) {
	var exp = require('../expansions/' + list[i]);

	exp.whites = _.merge(exp.whites, exp.whites);
	exp.blacks = _.merge(exp.blacks, exp.blacks);
}

module.exports = exp;