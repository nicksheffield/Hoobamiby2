var _ = require('lodash');

module.exports = function(){
	this.whites = [];
	
	this.blacks = [];
	
	this.load = function() {
		for (var i = 0; i < arguments.length; i++) {
			var exp = require('../expansions/' + arguments[i]);

			this.whites = _.merge(this.whites, exp.whites);
			this.blacks = _.merge(this.blacks, exp.blacks);
		}
	};
};