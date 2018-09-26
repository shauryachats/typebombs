var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
var http = require('http').Server(app);
var io = require('socket.io')(http);

var wordEmitter = require('./wordemitter');

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
	wordList[socket.id]['test'] = true;
	userData[socket.id] = {};

	userData[socket.id].health = 100;
	userData[socket.id].points = 0;
	emitUserScore(socket);

	// send initial data.
	socket.emit('usersOnline', clients - 1);
	socket.broadcast.emit('usersOnline', clients - 1);

	// word emitter.
	// const wordEmitter = () => {setTimeout(() => {
	// 	let text = Math.random().toString(36).substring(7);
	// 	let speed = Math.random() * 5 + 5; 
	// 	socket.emit('newString', {
	// 		text : text,
	// 		speed : speed
	// 	});
	// 	wordList[socket.id][text] = true;
	// 	// set 
	// 	setTimeout(() => {
	// 		if (!wordList[socket.id].hasOwnProperty(text)) return;
	// 		console.log(socket.nickname + " " + text + " collided!");
	// 		delete wordList[socket.id][text];
	// 		userData[socket.id].health -= 5;
	// 		emitUserScore(socket);
	// 		console.log("words remaining : " + Object.keys(wordList[socket.id]).length);
	// 	}, speed * 1000);
	// 	wordEmitter();
	// }, Math.random() * 5000 + 1000)};
	// wordEmitter();
	wordEmitter.emitWords(socket);

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
// const 

http.listen(3000, () => {
	console.log('listening on *:3000');
});