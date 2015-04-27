var mem = require('../modules/memory');
var _ = require('lodash');

function control(io, socket) {

	socket.on('choose', function(data){
		// get the game that this player is involved in
		var game = mem.findGame(socket.id);

		// get this player
		var player = mem.findPlayer(socket.id);

		// if no game, die
		if(!game) return false;

		// if no player, die
		if(!player) return false;

		// if the winner has already been chosen, die
		if(game.chosen) return false;

		// set the chosen flag to true
		game.chosen = true;

		// find the winning player
		var winningPlayer = mem.findPlayer(data.socketID);

		// give them the black card
		winningPlayer.blackCards.push(game.blackCard.text);

		// let them know they won
		winningPlayer.emitUpdate();

		// tell everyone else they won
		winningPlayer.broadcastUpdate();

		// update everbody
		game.announceUpdate();

		// wait 5 seconds and then reset the game
		setTimeout(function(){

			// set the chosen flag to false
			game.chosen = false;

			// for each of the submissions
			for(var playerID in game.submissions){

				// get the player
				var player = mem.findPlayer(playerID);

				// get a list of the white cards in the players hand
				var newCards = player.whiteCards;

				// go through each card in the submission
				for(var i=0; i<game.submissions[playerID].length; i++){

					// remove that card from the players hand
					newCards = _.reject(newCards, function(card){
						return card.text == game.submissions[playerID][i].text;
					});
				}

				// give the smaller list of cards back to the player
				player.whiteCards = newCards;

				// empty submissions array attached to the player
				player.submissions = [];
				
				// delete the submissions array attached to the game
				delete game.submissions[playerID];
			}

			// choose a new black card
			game.newBlack();

			// hide the cards again
			game.reveal = false;

			// for everyone in the game
			_.forEach(game.players, function(player){
				// deal them their cards
				game.dealCards(player);

				// and make sure they're not waiting
				player.waiting = false;

				// now emit the updates to them
				player.emitUpdate();
			});

			// choose a new judge
			game.nextJudge();

			// update everbody
			game.announceUpdate();

		}, 5 * 1000);
	});

}

module.exports = control;