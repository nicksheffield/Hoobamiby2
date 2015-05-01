var mem = require('../modules/memory');
var Game = require('../modules/game');
var Player = require('../modules/player');
var _ = require('lodash');

function control(io, socket) {

	socket.on('submit', function(data) {
		console.log('submit');

		// delete hashkey property that angular adds
		delete data.$$hashKey;

		console.log('socket.id', socket.id);

		// find the game this player is in
		var game = mem.findGame(socket.id);

		// if there's no game, die
		if (!game) return;

		// if this player has no submissions yet...
		if (game.submissions[socket.id] === undefined) {
			// ...then set that up as an arr
			game.submissions[socket.id] = [];
		}

		// add the new card into the players submissions
		game.submissions[socket.id].push(data);

		// find this player
		var player = mem.findPlayer(socket.id);

		// add this card to their submissions
		player.submissions = game.submissions[socket.id];

		// update them
		player.emitUpdate();

		// count how many cards each person submitted
		var sums = _.map(game.submissions, function(sub) {
			return sub.length;
		});

		var amountOfPlayers = _.sum(_.map(game.players, function(p) {
			return p.waiting ? 0 : 1;
		}));

		// if everyone's cards matches the right amount
		if (_.sum(sums) == ((amountOfPlayers - 1) * game.blackCard.pick)) {

			// flip 'em over
			game.reveal = true;

			// shuffle the cards
			game.submissions = objShuffle.shuffleProperties(game.submissions);
		}

		// update the game on everybodies browser
		game.announceUpdate();

	});

}

// http://blog.corrlabs.com/2011/02/shuffling-object-properties-in.html
Array.prototype.shuffle = function() {
	for (var i = 0; i < this.length; i++) {
		var a = this[i];
		var b = Math.floor(Math.random() * this.length);
		this[i] = this[b];
		this[b] = a;
	}
};

var objShuffle = {
	getKeys: function(obj) {
		var arr = [];
		for (var key in obj)
			arr.push(key);
		return arr;
	},
	shuffleProperties: function(obj) {
		var new_obj = {};
		var keys = this.getKeys(obj);
		keys.shuffle();
		for (var key in keys) {
			if (key == "shuffle") continue; // skip our prototype method
			new_obj[keys[key]] = obj[keys[key]];
		}
		return new_obj;
	}
};


module.exports = control;