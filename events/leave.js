var mem = require('../modules/memory');
var Player = require('../modules/player');
var _ = require('lodash');

function control(io, socket) {

	socket.on('leave', function() {
		console.log('leave');
		leave(socket.id);
	});

	socket.on('disconnect', function() {
		console.log('disconnect');
		leave(socket.id);
	});

	function leave(socketID) {

		// for each game
		var game = mem.findGame(socketID);

		// if there is a game
		if (game) {

			// find this player
			var player = mem.findPlayer(socketID);

			// if the judge leaves
			if(player.isJudge){
				
				// refund all white cards
				game.refundSubmissions();

				// choose another black card
				game.newBlack();

				// set game to default ready state
				game.reveal = false;
				game.chosen = false;
				game.submissions = {};

				// choose another judge
				game.nextJudge();
			}

			// make sure to leave that games room
			socket.leave(game.roomName);

			// don't keep the player that's leaving
			game.removePlayer(socketID);

			console.log(player.name, 'left game', game.roomName);

			// announce to all the other players that there was a change
			game.announceUpdate();
		}

	}

}

module.exports = control;