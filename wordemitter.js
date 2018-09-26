/*
	This logic handles the word generation and emission.
*/

const wordEmitter = (socket) => {
	setTimeout(() => {
		let wordGenerated = wordGenerator();
		
		wordEmitter(socket);
	});
}