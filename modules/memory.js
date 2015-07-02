var _ = require('lodash');
var redis = require('redis');

var client = redis.createClient();

client.on('connect', function() {
	console.log('|    Redis connected                         |');
	console.log('----------------------------------------------');
});

module.exports = {
	games: {},
	players: {},
	expansions: {},

	findGame: function(socketID) {
		return _.find(this.games, function(game) {
			if(game === undefined) return false;
			return _.find(game.players, function(player) {
				return player.data.socketID == socketID;
			});
		});
	},

	findPlayer: function(socketID) {
		return _.find(this.players, function(player) {
			return player.data.socketID == socketID;
		});
	},

	deleteGame: function(game) {
		console.log('game deleted from inactivity:', game.roomName);

		console.log('games before:', _.keys(this.games));
		delete this.games[game.roomName];
		console.log('games after:', _.keys(this.games));
	}
};