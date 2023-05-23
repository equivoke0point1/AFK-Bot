
const pngjs = require('pngjs-image'); // этот файл предназначен для прохождения капчи с картой в руке, не знаю как она работает, но раньше было норм
const colors = require('./colors.json')
const config = require("./config/config.json");

const fetch = require('node-fetch');
const formData = require('form-data');
const fs = require('fs')

const form = new formData();

function getMapImage(data) {
	if (!data) return;

	const size = Math.sqrt(data.length);
	const image = pngjs.createImage(size, size);

	for (let x = 0; x < size; x++) {
		for (let z = 0; z < size; z++) {
			const colorId = data[x + (z * size)];
			image.setAt(x, z, getColor(colorId));
		}
	}

	image.writeImage(`${__dirname}/assets/captha.png`, function(err) {
		if (err) throw err;
		form.append('file1', fs.createReadStream(`${__dirname}/assets/captha.png`)); // give absolute path if possible
		let URL = `${config.discordWebhook}`;
		// при прописывании без кавычек он определяет вебхук по другому и post не работает нихера хд
		fetch(URL, {
			'method': 'POST',
			'body': form,
			headers: form.getHeaders()
		})
			.catch(err => console.error(err));

	});

}

function getColor(colorId) {

	colorId -= 3 //

	if (!colors[colorId]) return {
		red: 255,
		green: 255,
		blue: 255,
		alpha: 255
	}
	else return colors[colorId];

}

module.exports.getMapImage = getMapImage;
