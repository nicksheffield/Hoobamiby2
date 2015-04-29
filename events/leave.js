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

			// remove the player from the game
			game.removePlayer(socketID);

			// make sure to leave that games room
			socket.leave(game.roomName);

			// the following code counts how many people are not able to submit this turn.
			var continueable = true;
			var c = 0;

			for(var i=0; i<game.players; i++){
				var p = game.players[i];
				if(p.isJudge || p.waiting){
					c += 1;
				}
			}

			// if the judge is the one leaving
			// or if all the players are unable to submit this turn
			if(player.isJudge || (c == game.players.length)){
				
				// refund all white cards
				game.refundSubmissions();

				// choose another black card
				game.newBlack();

				// set game to default ready state
				game.reveal = false;
				game.chosen = false;
				game.submissions = {};
			}

			// if the judge is the one leaving
			if(player.isJudge){
				// choose another judge
				game.nextJudge();
			}

			console.log(player.name, 'left game', game.roomName);

			// announce to all the other players that there was a change
			game.announceUpdate();
		}

	}

}

module.exports = control;