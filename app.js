var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = (process.env.PORT || 5000);

var WordEmitter = require('./wordemitter');

let clients = 0;
let rooms = 0;

global.wordList = {};
global.userData = {};

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	++clients;
	let currentRoom = selectRoom(socket);
	console.log(`${clients} user connected in room ${currentRoom}!`);
	socket.nickname = "user-" + clients;

	//initialize wordlist
	wordList[socket.id] = {};
	userData[socket.id] = {};

	userData[socket.id].health = 100;
	userData[socket.id].points = 0;
	emitUserScore(socket);

	// send initial data.
	socket.emit('usersOnline', clients - 1);
	socket.broadcast.emit('usersOnline', clients - 1);

	wordEmitter = new WordEmitter(socket);
	wordEmitter.startEmitting();

	socket.on('wordTyped', (data) => {
		console.log("got word typed : " + data);
		userData[socket.id].points += 5;
		emitUserScore(socket);
		delete wordList[socket.id][data];
	});

	socket.on('disconnect', () => {
		--clients;
		console.log('User disconnected!');
		emitUserScore(socket);
		wordEmitter.stopEmitting();
		socket.emit('usersOnline', clients - 1);
	});
});

const selectRoom = (socket) => {
	if (io.nsps["/"].adapter.rooms[rooms] && io.nsps["/"].adapter.rooms[rooms].length > 1) rooms++;
	socket.join(rooms);
	return rooms;
}

const emitUserScore = (socket) => {
	socket.emit('userScoreData', {
		health : userData[socket.id].health,
		points : userData[socket.id].points
	});
}

http.listen(port, () => {
	console.log(`listening on PORT : ${port}`);
});