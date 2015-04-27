var mem = require('../modules/memory');

function control(io, socket) {

	socket.on('requestWhite', function(count) {
		// get the player
		var player = mem.findPlayer(socket.id);
		
		// get the game
		var game = mem.findGame(socket.id);

		// if there is no player, do nothing
		if(!player) return false;

		// if there is no game, do nothing
		if(!game) return false;

		// get a new card from the game
		player.whiteCards.concat(game.getWhites(1));

		// and send it back to this player
		socket.emit('whites', cards);
	});

	socket.on('requestBlack', function(){
		// get the game that this player is involved in
		var game = mem.findGame(socket.id);

		if(!game) return false;

		// get a new black card
		game.newBlack();

		// update everbody
		game.announceUpdate();
	});

	socket.on('chooseRoundWinner', function(data){
		// get the game that this player is involved in
		var game = mem.findGame(socket.id);

		if(!game) return false;

		// find the winning player
		var winningPlayer = mem.findPlayer(data.player.socketID);

		// give them the black card
		winningPlayer.blackCards.push(game.blackCard);

		// tell them they won
		winningPlayer.emitUpdate();

		// tell everyone else they won
		winningPlayer.broadcastUpdate();

		// get a new black card
		game.newBlack();

		// clear the white cards off the table
		game.whiteCards = [];

		// update everbody
		game.announceUpdate();
	});

}

module.exports = control;