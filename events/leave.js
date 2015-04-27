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

		if (game) {
			// make sure to leave that games room
			socket.leave(game.roomName);

			// don't keep the player that's leaving
			game.removePlayer(socketID);

			console.log('player left game');

			// announce to all the other players that there was a change
			game.announceUpdate();
		}

	}

}

module.exports = control;