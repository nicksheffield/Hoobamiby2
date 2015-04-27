module.exports = function(io, socket){
	this.nickname = '';
	this.room = '';
	this.blackCards = [];
	this.whiteCards = [];
	this.isHost = false;
	this.isJudge = false;
	this.waiting = false;
	this.socketID = '';
	this.submissions = [];

	this.emit = function(event, data){
		socket.emit(event, data);
	};

	this.emitUpdate = function(){
		io.to(this.socketID).emit('playerUpdate', this);
	};

	this.broadcast = function(event, data){
		socket.broadcast.to(this.room).emit(event, data);
	};

	this.broadcastUpdate = function(){
		this.broadcast('otherPlayerUpdate', this);
	};
};