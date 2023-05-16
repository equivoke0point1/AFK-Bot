const { SlashCommandBuilder } = require('discord.js');
const config = require("../config/config.json");
const mineflayer = require("mineflayer");
const {startMineflayerBot} = require("../entry.js");

const mineflayer_config = {
    version: config.version,
    host: config.ip,
    username: config.name
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('init')
        .setDescription('Инициализирует бота'),
    async execute(interaction) {
        if(config.needCaptcha === true) {
            message.reply("Введите капчу!");
        }
        else{
            message.reply("В конфигурационном файле отключена проверка капчи, игнорирование.")
        }
        startMineflayerBot(mineflayer_config);
    },
};
