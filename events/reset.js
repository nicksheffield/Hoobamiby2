var mem = require('../modules/memory');
var _ = require('lodash');

function control(io, socket) {

	socket.on('reset', function(data){
		console.log('reset');
		// get the game that this player is involved in
		var game = mem.findGame(socket.id);

		// get this player
		var player = mem.findPlayer(socket.id);

		// if no game, die
		if(!game) return false;

		game.reset();

		_.forEach(game.players, function(player){
			player.reset();
			game.dealCards(player);

			player.emitUpdate();
		});

		game.announceToPlayers('resetGame');

		game.announceUpdate();
	});

}

module.exports = control;