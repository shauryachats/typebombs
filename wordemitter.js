/*
	This logic handles the word generation and emission.
*/
const TIME_BETWEEN_WORDS = 5;

const emitWords = (socket) => {
	setTimeout(() => {
		let word = wordWrappedData(); 
		socket.emit('newWord', word);
		console.log("Emitting word : " + word.text);
		wordList[socket.id][word.text] = word;

		setTickTock(socket, word);

		emitWords(socket);
	}, TIME_BETWEEN_WORDS * 1000);
}
exports.emitWords = emitWords;

/*
	setTickTock sets a timeout for when the word would
	be expected to hit the end.
*/
const setTickTock = (socket, word) => {
	setTimeout(() => {
		// if word is not present in wordList, it has been typed.
		if (!wordList[socket.id].hasOwnProperty(word.text)) return;
		// else COLLISION!
		console.log("In " + socket.nickname + "'s game, " + word.text + " collided!");
		delete wordList[socket.id][word.text];

		userData[socket.id].health -= 5;
		emitUserScore(socket);

	}, word.speed * 1000);
}

const wordWrappedData = () => {
	return {
		text : Math.random().toString(36).substring(7),
		speed : Math.random() * 5 + 5
	};
}

const emitUserScore = (socket) => {
	socket.emit('userScoreData', {
		health : userData[socket.id].health,
		points : userData[socket.id].points
	});
}
