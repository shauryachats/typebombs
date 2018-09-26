/*
	Global variables, are they bad?
*/
const WIDTH = 800;
const HEIGHT = 800;
const FPS = 45;
const MAX_WORDS_AT_ONCE = 10;
const VACANCY_THRESHOLD = 0.2;

let canvas = null;
let context = null;
let socket = null;

let wordlist = {};
let availableSpaces = [];

$(document).ready(() => {
	socket = io();
	initializeCanvas();

	for (let dummy = 1; dummy <= MAX_WORDS_AT_ONCE; ++dummy)
		availableSpaces.push(dummy / MAX_WORDS_AT_ONCE);

	socket.on('usersOnline', (data) => {
		$('#avail').html(`${data} users connected!`);
		socket.emit('ready', null);
	});

	socket.on('newString', (data) => {
		wordlist.push(
			Object.assign(data, {
				'x' : 1.0,
				'y' : getRandomSpace()
			})
		);
	});

	socket.on('healthUpdate', (data) => {
		$('#health').html(`Health : ${data}`);
	});

	// set keyup task.
	$('#type').keyup((event) => {
		let stringInput = $('#type').val();
		if (stringInput[ stringInput.length - 1] == ' ') {
			$('#type').val("");
			stringInput = stringInput.slice(0, -1);
			socket.emit('wordTyped', stringInput.slice(0, -1));
		}
	});

	setInterval(renderCanvas, 1000 / FPS);
});

const initializeCanvas = () => {
	canvas = $('#play')[0];
	context = canvas.getContext('2d');
	context.canvas.width = WIDTH;
	context.canvas.height = HEIGHT;
}

const renderCanvas = () => {
	//clearing the previous frame
	context.clearRect(0, 0, WIDTH, HEIGHT);

	context.font = "30px arial";
	//drawing the wordlist
	for (let word of wordlist) {
		context.fillText(word.text, word.x * WIDTH, word.y * HEIGHT);
	}

	updateWordList();
}

const updateWordList = () => {
	for (let property in wordlist) {
		wordlist[property].x -= 1 / (wordlist[property].speed * FPS);
		if (wordlist[property].x < 0) {
			wordlist.splice(property, 1);
			availableSpaces.push(wordlist[property].y);
			availableSpaces.sort();
		}
	}
}

const getRandomSpace = () => {
	console.log(availableSpaces);
	let index = Math.floor(Math.random() * availableSpaces.length);
	let space = availableSpaces[index];
	availableSpaces.splice(index, 1);
	return space;
	// return Math.floor(Math.random() * MAX_WORDS_AT_ONCE + 1);
}