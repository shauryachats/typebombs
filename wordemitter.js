/*
	This logic handles the word generation and emission.
*/
const TIME_BETWEEN_WORDS = 1;
var keepEmittingWords = true;

class WordEmitter {

	constructor(socket) {
		this.socket = socket;
		this.timer = null;
	}

	stopEmitting() {
		clearInterval(this.timer);
	}

	startEmitting() {
		this.emitWords();
	}
	
	emitWords() {
		this.timer = setTimeout(() => {
			let word = wordWrappedData(); 
			this.socket.emit('newWord', word);
			console.log("Emitting word : " + word.text);
			wordList[this.socket.id][word.text] = word;

			setTickTock(this.socket, word);

			this.emitWords();
		}, 
		TIME_BETWEEN_WORDS * 1000);	
	}
}
module.exports = WordEmitter;

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
