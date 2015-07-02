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
	var loaded_exp = require('../expansions/' + list[i]);

	exp.whites = _.merge(exp.whites, loaded_exp.whites);
	exp.blacks = _.merge(exp.blacks, loaded_exp.blacks);
}

module.exports = exp;