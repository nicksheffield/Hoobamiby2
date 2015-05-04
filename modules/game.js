var mem = require('./memory');
var Expansions = require('./expansions');
var _ = require('lodash');

module.exports = function(io, socket) {
	// public properties
	this.roomName = '';
	this.winnerID = '';
	this.host = {};
	this.judge = {};
	this.players = [];
	this.blackCard = {};
	this.submissions = {};
	this.started = false;
	this.ended = false;
	this.reset = false;
	this.reveal = false;
	this.chosen = false;
	this.timeoutSeconds = 10; // amount of seconds before empty rooms are destroyed
	this.minPlayers = 2; // minimum amount of players before the start button works
	this.scoreLimit = 6; // determines when the game ends
	this.gloatTime = 5; // amount of seconds to show the round winner card

	// private properties
	var cards = new Expansions();
	var usedWhites = [];
	var usedBlacks = [];
	var destroyTimer = null;
	var self = this;

	cards.load('default', 'first', 'second', 'third', 'pax', 'custom');

	this.generateRoomName = function(len) {
		// any letters in here MUST be lowercase. Uppercase will be IMPOSSIBLE to match
		var chars = [
			//'1', '2', '3', '4', '5', '6', '7', '8', '9',
			'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k',
			'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u',
			'v', 'w', 'x', 'y', 'z'
		];
		var roomName;

		// generate a room name and check if it's already in use.
		// if so, do it again.
		// keep going until it's not in use
		do {
			roomName = '';

			for (var i = 0; i < len; i++) {
				roomName += chars[parseInt(Math.random() * chars.length)];
			}

		} while (mem.games[roomName] !== undefined);

		this.roomName = roomName;
	};

	this.getWhites = function(n) {
		var hand = [];

		n = n ? n : 1;

		for (var i = 0; i < n; i++) {
			var card;

			do {
				card = _.sample(cards.whites);
			} while (usedWhites.indexOf(card) != -1);

			usedWhites.push(card);
			hand.push(card);
		}

		return hand;
	};

	this.getBlack = function() {
		var card;

		do {
			card = _.sample(cards.blacks);
		} while (usedBlacks.indexOf(card) != -1);

		usedBlacks.push(card);
		return card;
	};

	this.newBlack = function() {
		this.blackCard = this.getBlack();
	};

	this.announceUpdate = function() {
		this.announceToPlayers('gameUpdate', self);
	};

	this.announceToPlayers = function(event, data) {
		if (this.players.length > 0) {
			if (io.sockets.adapter.rooms[this.roomName] !== undefined) {
				process.stdout.write("announcing to players in room " + this.roomName + "... ");
				io.sockets.in(this.roomName).emit(event, data);
				process.stdout.write("done\n");
			} else {
				console.log('would have announced game, but no room');
			}
		}
	};

	this.chooseNewHost = function() {
		console.log('choosing host');
		var player = _.sample(this.players);

		player.isHost = true;
		player.emitUpdate();

		this.host = player;

		this.announceUpdate();
	};

	this.nextJudge = function() {

		this.judge.isJudge = false;

		this.judge.emitUpdate();

		var index = 0;

		_.forEach(this.players, function(player, i) {
			if (player.socketID == self.judge.socketID) {
				index = i;
			}
		});

		if (index >= this.players.length - 1) {
			index = 0;
		} else {
			index++;
		}

		this.judge = this.players[index];

		if (this.judge !== undefined) {
			this.judge.isJudge = true;

			this.judge.emitUpdate();
		}
	};

	this.addPlayer = function(player) {
		this.players.push(player);

		console.log('adding player');
		// tell the user what room they're in
		player.room = this.roomName;

		if (this.players.length === 1) {
			this.chooseNewHost();
			console.log('host chosen');
		}

		clearTimeout(destroyTimer);
		console.log('stopped timer');
	};

	this.removePlayer = function(socketID) {
		var wasHost = mem.findPlayer(socketID).isHost;

		this.players = _.reject(this.players, function(p) {
			return p.socketID == socketID;
		});

		delete this.submissions[socketID];

		if (this.players.length === 0) {

			clearTimeout(destroyTimer);
			console.log('started timer');
			destroyTimer = setTimeout(function() {
				mem.deleteGame(self);
			}, self.timeoutSeconds * 1000);

		} else if (wasHost) {
			this.chooseNewHost();
		}
	};

	this.dealCards = function(player) {
		// if the player has less than 10 cards
		if (player.whiteCards.length < 10) {

			// then count how many new cards until they have 10
			var count = 10 - player.whiteCards.length;

			var newCards = this.getWhites(count);

			// and give them that many cards
			player.whiteCards = player.whiteCards.concat(newCards);
		}
	};

	this.refundSubmissions = function() {
		_.forEach(this.players, function(player) {
			player.submissions = [];

			player.emitUpdate();
		});
	};

	this.reset = function() {
		this.chosen = false;
		this.reveal = false;
		this.started = false;
		this.ended = false;

		this.winnerID = '';

		this.submissions = {};
		this.judge = {};

		this.newBlack();

		usedBlacks = [];
		usedWhites = [];
	};
};