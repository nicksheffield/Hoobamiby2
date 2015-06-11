var _ = require('lodash');

module.exports = function(socket_id){	
	this.data = {
		nickname: '',
		room: '',
		blackCards: [],
		whiteCards: [],
		isHost: false,
		isJudge: false,
		waiting: false,
		socketID: socket_id,
		submissions: []
	};

	this.fill = function(data){
		this.data = _.merge(this.data, data);
	};

	this.emit = function(event, data){
		socket.emit(event, data);
	};

	this.emitUpdate = function(){
		this.emit('playerUpdate', this);
	};

	this.broadcast = function(event, data){
		socket.broadcast.to(this.room).emit(event, data);
	};

	this.broadcastUpdate = function(){
		this.broadcast('otherPlayerUpdate', this);
	};

	this.reset = function(){
		this.whiteCards = [];
		this.blackCards = [];
		this.submissions = [];
		this.isJudge = false;
	};
};