const config = require('../config/config.json'); // Подключаем файл с параметрами и информацией
const Discord = require('discord.js'); // Подключаем библиотеку discord.js
const prefix = config.prefix; // «Вытаскиваем» префикс

// Команды //

function test(robot, mess, args) {
    mess.channel.send('Test!')
}


// Список команд //

var comms_list = [{
    name: "test",
    out: test,
    about: "Тестовая команда"
}];

// Name - название команды, на которую будет реагировать бот
// Out - название функции с командой
// About - описание команды

module.exports.comms = comms_list; // это всё вообще не я писал, а мой старый друг, но я хз что тут, и разбираться мне лень :D (хотя выглядит это интересно)
// todo - приварить это к основному коду или выпилить