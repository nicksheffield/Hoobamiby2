var mem = require('../modules/memory');
var Player = require('../modules/player');
var _ = require('lodash');

function control(io, socket){

	socket.on('join', function(data){

		console.log('join');

		// translate down to lowercase
		data.roomName = data.roomName.toLowerCase();

		// if this game doesn't exist
		if(mem.games[data.roomName] === undefined){
			// tell the user
			socket.emit('noGame');

			// and quit this function
			return;
		}

		// join the room
		socket.join(data.roomName);

		// get the game from mem
		var game = mem.games[data.roomName];
		
		// get a player, may be new, may be from game
		var player = _.find(game.players, function(player){
			return player.socketID == socket.id;
		});

		if(!player){
			// create a new player
			player = new Player(io, socket);

			// set the player data
			player.nickname = data.nickname;
			player.socketID = socket.id;

			// add the player to the list of players
			mem.players[socket.id] = player;

			// add the player to the game
			game.addPlayer(player);
		}

		// if the game is started already
		if(game.started && game.players.length > 2){
			// then make the player wait until the next round
			player.waiting = true;
		}

		// deal the player some cards
		game.dealCards(player);

		// send a gameUpdate to all players in the game
		game.announceUpdate();

		// tell the player that they just joined
		player.emit('gameJoined', {
			game: game,
			player: player
		});
	});

}

module.exports = control;