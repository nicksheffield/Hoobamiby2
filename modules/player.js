var _ = require('lodash');
var io = require('./socket');

module.exports = function(socket_id){	
	var socket;
	
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
	
	if(this.data.socketID){
		socket = io.sockets.connected[this.data.socketID];
	}

	this.fill = function(data){
		this.data = _.merge(this.data, data);
		
		socket = io.sockets.connected[this.data.socketID];
	};

	this.emit = function(event, data){
		socket.emit(event, data);
	};

	this.emitUpdate = function(){
		this.emit('playerUpdate', this.data);
	};

	this.broadcast = function(event, data){
		socket.broadcast.to(this.data.room).emit(event, data);
	};

	this.broadcastUpdate = function(){
		this.broadcast('otherPlayerUpdate', this.data);
	};

	this.reset = function(){
		this.data.whiteCards = [];
		this.data.blackCards = [];
		this.data.submissions = [];
		this.data.isJudge = false;
	};
};