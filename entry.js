//Discord imports
const Discord = require("discord.js");
const config = require("./config/config.json");
const { Client, Events, Webhook, GatewayIntentBits } = require('discord.js');
const prefix = config.discordPrefix;
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

//Mineflayer imports
const mineflayer = require("mineflayer");
const tpsPlugin = require('mineflayer-tps')(mineflayer)
const mcapi = require('mcapi');
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear } = require('mineflayer-pathfinder').goals
const fetch = require("node-fetch");
const fs = require("fs");
const color = require('./color.js');
const webhook = require("webhook-discord")
let spawned = false;
const channel = client.channels.cache.get(config.channelID);

client.on("messageCreate", function(message) {
    if (message.author.bot) return;

    //Commands
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).split(' ');
        const command = message.content.slice(prefix.length).split(' ').shift().toLowerCase();

        switch(command) {
            case "init": {
                if(config.needCaptcha === true) {
                    message.reply("Введите капчу!");
                }
                else{
                    message.reply("В конфигурационном файле отключена проверка капчи, игнорирование.")
                }
                startMineflayerBot(mineflayer_config);
                break;
                    //message.reply("Бот уже запущен!");

            }
            case "tps": {
                message.reply("Начинаю делать запрос!").then((msg) => {
                    fetch('https://mcapi.us/server/status?ip=highland.20tps.ru')
                    .then((response) => {
                        return response.json();
                    })
                    .then((data) => {
                        let motd = data.motd;
                        let players = data.players.now;
                        
                        const embed = new Discord.EmbedBuilder()
                            .setColor(0x0099FF)
                            .addFields(
                                //{name: "MOTD", value: `${motd.replace("2B", "").replace("2T","")}`, inline: false},
                                {name: "TPS", value: `${minecraft_bot.getTps()}`, inline: false},
                                {name: "PLAYERS", value: `${players}`, inline: false}
                            )
                            .setThumbnail("https://cdn.discordapp.com/attachments/1059790398979067954/1060511874048868352/KojlwheEEEIIYQEa8qDhByz5irkzxK7IQb4xnHUbgoDOmlJQlBkKzzBbMORvhJu7RCAAAAAElFTkSuQmCC.png")
    
                        msg.edit({embeds: [embed]});
                    });
                });
                break;
            }
            case "tab": {
                const playerList = Object.keys(minecraft_bot.players);
                const lister = minecraft_bot.players;
                let str = '';
                for (let x of playerList) {
                    let emoji = ":white_large_square:";

                    if (lister[x].ping <= 100) {
                        emoji = ":green_square:";
                    } else if (lister[x].ping <= 200 && lister[x].ping >= 100) {
                        emoji = ":yellow_square:";
                    } else if (lister[x].ping > 200) {
                        emoji = ":red_square:";
                    }	

                    if (lister[x].username.startsWith("_")) {
                        str = `${str}${emoji} \\${lister[x].username} **${lister[x].ping}ms.**\n`
                    } else {
                        str = `${str}${emoji} ${lister[x].username} **${lister[x].ping}ms.**\n`
                    }
                }

                str.slice(0, 4090);

                const embed = new Discord.EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`tab list (${Object.keys(minecraft_bot.players).length} players)`)
                    .setDescription(str);
                message.channel.send({
                    embeds: [embed]
                });
                break;
            }
        }
    } else {
        if (minecraft_bot != null && message.channel.id === config.channelID) {
            minecraft_bot.chat(message.content);
        }
    }

}); // команды
let minecraft_bot = null;
let stats = null;

const mineflayer_config = {
    version: config.version,
    host: config.ip,
    username: config.name
} // конфиг

const hook = new webhook.Webhook(config.discordWebhook);

function startMineflayerBot(cfg) {
    minecraft_bot = mineflayer.createBot(cfg);
    minecraft_bot.loadPlugin(tpsPlugin);
    minecraft_bot.on('login', function (){
        spawned = true;
    });
    minecraft_bot.on('kicked', function() {
        startMineflayerBot(mineflayer_config);
    });
    minecraft_bot.on('messagestr', message => {
        console.log(message);
        if (message.includes("игроков")) {
            stats = message;
            console.log(`${stats} стата`)
        }
        if (message.includes("Миру")) {
            stats = `${stats}\n${message}`
        }
        if (message.startsWith("Авторизация:")) {
            minecraft_bot.chat("/l 123123#21");
            return;
        }
        if (message.startsWith("Регистрация:")) {
            minecraft_bot.chat("/reg 123123#21 123123#21");
            return;
        }
        if (message.startsWith("Неверная")) {
            startMineflayerBot(mineflayer_config);
            return;
        }
    });
    if(config.needCaptcha === true){
    minecraft_bot._client.on('map', ({data}) => {
        color.getMapImage(data);
    });
    }
    minecraft_bot.loadPlugin(pathfinder)
    minecraft_bot.on("chat", (username, message, jsonMsg) => {
        const defaultMove = new Movements(minecraft_bot)
        if (config.pathFinding = true) {
            if (username === minecraft_bot.username) return
            const target = minecraft_bot.players[username] ? minecraft_bot.players[username].entity : null
            if (message === '$gotome') {
                if (!target) {
                    minecraft_bot.chat('Вы должны быть в зоне моей прогрузки!')
                    return
                }
                else {
                    minecraft_bot.chat('В пути.')
                }
                const p = target.position
                minecraft_bot.pathfinder.setMovements(defaultMove)
                minecraft_bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1))
            }
            if (message === '$healthcheck') {
                minecraft_bot.chat('Статус: Бот активен.') // если он не будет активен, то он не сможет отправить это сообщение xD
            }
            if (message === '$help') {
                minecraft_bot.chat('|||  Help  |||')
                minecraft_bot.chat('$help - Отрывает это меню.')
                minecraft_bot.chat('$gotome - Бот идёт к вам.')
                minecraft_bot.chat('$healthcheck - Отправляет отчёт о статусе бота в данный момент')
                //minecraft_bot.chat('$healthcheck - Отправляет отчёт о статусе бота в данный момент')
            }
        }
        if (username != config.name && message != "$gotome" && message != "$healthcheck" && message != "$help") {
            const msg = new webhook.MessageBuilder()
                .setName(`${username}`)
                .setText(`${message}`)
                .setAvatar(`https://minotar.net/helm/${username}`);
            hook.send(msg);
        }});

}

//Discord
client.login(config.discordToken);
client.on("ready", function() {
    console.log(client.user.username + " запущен.");
    startMineflayerBot(mineflayer_config)
});
