var mem = require('../modules/memory');
var Player = require('../modules/player');
var _ = require('lodash');

function control(io, socket) {

	socket.on('join', function(data) {

		console.log('join');

		// translate down to lowercase
		data.roomName = data.roomName.toLowerCase();
		
		console.log(1);

		// if this game doesn't exist
		if (mem.games[data.roomName] === undefined) {
			// tell the user
			socket.emit('noGame');
		
		console.log(2);

			// and quit this function
			return;
		}
		
		console.log(3);

		// join the room
		socket.join(data.roomName);
		
		console.log(4);

		// get the game from mem
		var game = mem.games[data.roomName];
		
		console.log(5);

		// get a player, may be new, may be from game
		var player = _.find(game.players, function(player) {
			return player.data.socketID == socket.id;
		});
		
		console.log(6);

		if (!player) {
			// create a new player
			player = new Player(socket.id);
		
		console.log(7);

			// set the player data
			player.data.nickname = data.nickname;
			player.data.socketID = socket.id;
		
		console.log(8);

			// add the player to the list of players
			mem.players[socket.id] = player;
		
		console.log(9);

			// add the player to the game
			game.addPlayer(player);
		
		console.log(10);
		}
		
		console.log(11);

		// if the game is started already
		if (game.started && game.players.length > 2) {
		
		console.log(12);
			// then make the player wait until the next round
			player.data.waiting = true;
		}
		
		console.log(13);

		// deal the player some cards
		game.dealCards(player);
		
		console.log(14);

		// send a gameUpdate to all players in the game
		game.announceUpdate();
		
		console.log(15);

		// tell the player that they just joined
		player.emit('gameJoined', {
			game: game,
			player: player.data
		});
		
		console.log(16);
	});

}

module.exports = control;