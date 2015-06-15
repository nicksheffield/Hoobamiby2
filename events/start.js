var mem = require('../modules/memory');
var _ = require('lodash');
var p = require('pluralize');

function control(io, socket) {

	socket.on('start', function() {

		console.log('start');

		// find the game
		var game = mem.findGame(socket.id);

		// if there's no game, do nothing
		if (!game){
			console.log('No game was found for some reason');
			return;
		}

		if (game.players.length < game.minPlayers) {
			console.log('game not started, only ' + game.players.length + ' ' + p('player', game.players.length) + ', needs at least ' + game.minPlayers);
			return;
		}

		console.log(game.roomName, 'started');

		// start the game
		game.started = true;

		// choose the first judge
		game.judge = _.sample(game.players);

		// tell them they're the judge
		game.judge.isJudge = true;
		game.judge.emitUpdate();

		// tell everyone the game has begun
		game.announceUpdate();
	});

}

module.exports = control;