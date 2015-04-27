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
		if(!game) return;

		// if this player has no submissions yet...
		if(game.submissions[socket.id] === undefined){
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
		var sums = _.map(game.submissions, function(sub){
			return sub.length;
		});

		// if everyone's cards matches the right amount
		if(_.sum(sums) == ((game.players.length - 1) * game.blackCard.pick)){
			
			// flip 'em over
			game.reveal = true;
		}

		// update the game on everybodies browser
		game.announceUpdate();

	});

}


module.exports = control;