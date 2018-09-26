/*
	Global variables, are they bad?
*/
const WIDTH = 700;
const HEIGHT = 700;
const FPS = 45;
const MAX_WORDS_AT_ONCE = 10;
const VACANCY_THRESHOLD = 0.2;

let canvas = null;
let context = null;
let socket = null;

let wordAttributes = {}; // attributes have all data of each word.

//TODO: Optimize the availableSpaces routine
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

	socket.on('newWord', (data) => {
		wordAttributes[data.text] = {
			...data,
			x : 1.0,
			y : getRandomSpace()
		};
	});

	socket.on('userScoreData', (userData) => {
		if (health <= 0) alert('Health less than zero!');
		$('#health').html(`Health : ${userData.health}, Points : ${userData.points}`);
	});

	// set keyup task.
	$('#type').keyup((event) => {
		let stringInput = $('#type').val();
		if (stringInput[ stringInput.length - 1] == ' ') {
			$('#type').val(""); 
			stringInput = stringInput.slice(0, -1);
			//check if the word is correct.
			if (wordAttributes.hasOwnProperty(stringInput))
			{
				delete wordAttributes[stringInput];
				socket.emit('wordTyped', stringInput);
			}
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

	//drawing the wordAttributes
	for (let word in wordAttributes) {
		context.fillText(wordAttributes[word].text, wordAttributes[word].x * WIDTH, wordAttributes[word].y * HEIGHT);
	}
	updateWordList();
}

const updateWordList = () => {
	for (let property in wordAttributes) {
		wordAttributes[property].x -= 1 / (wordAttributes[property].speed * FPS);
		//make available space.
		if (wordAttributes[property].x < 0) {
			availableSpaces.push(wordAttributes[property].y);
			availableSpaces.sort();
			delete wordAttributes[property];
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
