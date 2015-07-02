var mem = require('../modules/memory');
var Game = require('../modules/game');
var Player = require('../modules/player');

function control(io, socket) {

	socket.on('create', function(data) {
		console.log('create');

		// create the game
		var game = new Game(io, socket);

		// generate a room name for this game
		game.generateRoomName(4);

		// join the room
		socket.join(game.roomName);

		// add the game to mem
		mem.games[game.roomName] = game;

		// create a player
		var player = new Player(socket.id);

		// set the player data
		player.data.nickname = data.nickname;
		player.data.isHost = true;

		// add the player to the list of players
		mem.players[socket.id] = player;

		// add the player to the game
		game.addPlayer(player);

		// set the player up as the host of this game
		game.host = player;
		player.data.isHost = true;

		// deal them some cards
		game.dealCards(player);

		// set a starting black card
		game.newBlack();

		// send the game back
		socket.emit('gameCreated', {
			game: game,
			player: player.data
		});
	});

}

module.exports = control;