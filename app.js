var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));

var http = require('http').Server(app);
var io = require('socket.io')(http);

let clients = 0;
let rooms = 0;

let wordList = {};
let health = {};
let points = {};

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
	health[socket.id] = 100;
	points[socket.id] = 0;
	emitUserScore(socket);

	// send initial data.
	socket.emit('usersOnline', clients - 1);
	socket.broadcast.emit('usersOnline', clients - 1);

	// word emitter.
	const wordEmitter = () => {setTimeout(() => {
		let text = Math.random().toString(36).substring(7);
		let speed = Math.random() * 5 + 5; 
		socket.emit('newString', {
			text : text,
			speed : speed
		});
		wordList[socket.id][text] = true;
		setTimeout(() => {
			if (!wordList[socket.id].hasOwnProperty(text)) return;
			console.log(socket.nickname + " " + text + " collided!");
			delete wordList[socket.id][text];
			health[socket.id] -= 5;
			emitUserScore(socket);
			console.log("words remaining : " + Object.keys(wordList[socket.id]).length);
		}, speed * 1000);
		wordEmitter();
	}, Math.random() * 5000 + 1000)};
	wordEmitter();

	socket.on('wordTyped', (data) => {
		console.log("got word typed : " + data);
		points[socket.id] += 5;
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
		health : health[socket.id],
		points : points[socket.id]
	});
}

http.listen(3000, () => {
	console.log('listening on *:3000');
});