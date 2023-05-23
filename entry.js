//Discord imports
const Discord = require("discord.js");
const config = require("./config/config.json");
const { Client, Events, Webhook, GatewayIntentBits, SlashCommandBuilder} = require('discord.js');
const prefix = config.discordPrefix;
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ] // я опять же понятие не имею, почему он не опознает (лично у меня в IDE) эти интенты, и пишет варнинг, возможно проблема моей IDE но это всё работает
});

//Mineflayer imports
const mineflayer = require("mineflayer");
const tpsPlugin = require('mineflayer-tps')(mineflayer)
//const mcapi = require('mcapi');
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear } = require('mineflayer-pathfinder').goals
const fetch = require("node-fetch");
//const fs = require("fs");
const color = require('./color.js');
const webhook = require("webhook-discord")
const async = require("async");
//let spawned = false;
//const channel = client.channels.cache.get(config.channelID);

    client.on("messageCreate", function (message) {
        if (message.author.bot) return;
        if (message.content.startsWith("/")) return;
        //Commands
        if (message.content.startsWith(prefix)) {
            const args = message.content.slice(prefix.length).split(' '); // todo - аргументы к командам дискорд
            const command= message.content.slice(prefix.length).split(' ').shift().toLowerCase();

            switch (command) {
                case "init": {
                    if (config.needCaptcha === true) {
                        message.reply("Введите капчу!");
                    } else {
                        message.reply("В конфигурационном файле отключена проверка капчи, игнорирование.")
                    }
                    startMineflayerBot(mineflayer_config);
                    break;
                    //message.reply("Бот уже запущен!");

                }

                case "tps": {
                    message.reply("Начинаю делать запрос!").then((msg) => {
                        fetch(`https://mcapi.us/server/status?ip=${config.ip}`)
                            .then((response) => {
                                return response.json();
                            })
                            .then((data) => {
                                //let motd = data.motd;
                                let players = data.players.now;
                                let playersMax = data.players.max

                                const embed = new Discord.EmbedBuilder()
                                    .setColor(0x0099FF)
                                    .addFields(
                                        //{name: "MOTD", value: `${motd.replace("2B", "").replace("2T","")}`, inline: false}, // включить при необходимости, тут тоже остатки 2b2t
                                        {name: "TPS", value: `${minecraft_bot.getTps()}`, inline: false},
                                        {name: "ИГРОКИ", value: `${players}/${playersMax}`, inline: false}
                                    )
                                    .setThumbnail("https://cdn.discordapp.com/app-icons/1059831638982397962/e5cff388b30676d1d4da3341f2ab3623.png")
                                    .setFooter({ text: 'Источник: mcapi.us' })

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
                        message.channel.send({embeds: [embed]}); // я хз почему он не распознает функцию send, работает и ладно :D
                    break;
                }
            }
        } else {
            if (minecraft_bot != null && message.channel.id === config.channelID && config.silentMode !== true) {
                minecraft_bot.chat(message.author.username + ": " + message.content);
                void message.react("✔")
            }
        }

    }); // команды дискорда
let minecraft_bot = null;
//let stats = null;

const mineflayer_config = {
    version: config.version,
    host: config.ip,
    port: config.port,
    username: config.name,
    physics: config.physics // для того что бы наше чадо проходило антибот проверки на падение нужно ставить true в конфиге
} // конфиг

const hook = new webhook.Webhook(config.discordWebhook);
function startMineflayerBot(cfg) {
    minecraft_bot = mineflayer.createBot(cfg);
    minecraft_bot.loadPlugin(tpsPlugin);
    //minecraft_bot.on('login', function (){
        //spawned = true; // даже не помню, для чего я это писал, вроде как для капчи, ну да ладно
    //});

    minecraft_bot.once('end', function() {
        startMineflayerBot(mineflayer_config)
    })
    //minecraft_bot.on('login', function() {
        //minecraft_bot.chat("Бот зашёл на сервер и прогрузился в мир.") // а это вообще не работает как я задумывал todo - научитьяся определять, когда бот уже прогружен в мир и может реагировать на команды
    //})
    minecraft_bot.on('messagestr', message => {
        console.log(message);
        //if (message.includes("игроков")) {
            //stats = message;
            //console.log(`${stats} стата`)
        //}
        //if (message.includes("Миру")) {
            //stats = `${stats}\n${message}` // это всё осталось с того времени, как этот бот работал на копии 2b2t (2b2t.org.ru), оставил как память
        //}
        if (message.startsWith("Авторизация")) {
            minecraft_bot.chat("/login " + config.password);
        }
        if (message.includes("регистрации")) {
            minecraft_bot.chat("/reg " + config.password + " " + config.password);
        }
        //if (message.startsWith("Неверная")) {
            //startMineflayerBot(mineflayer_config);
            //return;
        //}
    });
    if(config.needCaptcha === true){
    minecraft_bot._client.on('map', ({data}) => {
        color.getMapImage(data);
    });
    }
    minecraft_bot.loadPlugin(pathfinder)
    minecraft_bot.on("chat", (username, message) => {
        const defaultMove = new Movements(minecraft_bot)
        let startMyPos;
        if (config.pathFinding === true) {
            if (username === minecraft_bot.username) return
            const target = minecraft_bot.players[username] ? minecraft_bot.players[username].entity : null
            if (message === '$gotome') {
                const playerPos = target.position
                if (!target) {
                    minecraft_bot.chat('Вы должны быть в зоне моей прогрузки!')
                    return
                } else {
                    minecraft_bot.chat('Иду к игроку ' + target.username + ", по координатам " + Math.round(playerPos.x) + " " + Math.round(playerPos.y) + " " + Math.round(playerPos.z))
                }
                //startMyPos = minecraft_bot.entity.position
                minecraft_bot.pathfinder.setMovements(defaultMove)
                minecraft_bot.pathfinder.setGoal(new GoalNear(playerPos.x, playerPos.y, playerPos.z, 1))
                //setTimeout(() => {
                    //while (minecraft_bot.entity.velocity.x >= 0 || minecraft_bot.entity.velocity.y >= 0 ) {
                        //if (minecraft_bot.entity.velocity.x === 0 && minecraft_bot.entity.velocity.y === 0) {
                            //const endMyPos = minecraft_bot.entity.position
                            //if (Math.round(startMyPos.x) !== Math.round(endMyPos.x) && Math.round(startMyPos.y) !== Math.round(endMyPos.y)) {
                                //minecraft_bot.chat("Я не смог до вас добраться!")
                            //}
                        //} // todo - починить этот блок, и научить бота определять, если он не смог добраться до игрока
                    //}
                //}, 500)

                //const endMyPos = minecraft_bot.entity.position
                //if (Math.round(startMyPos.x) !== Math.round(endMyPos.x) || Math.round(startMyPos.y) !== Math.round(endMyPos.y) || Math.round(startMyPos.z) !== Math.round(endMyPos.z)){
                //minecraft_bot.chat("Я не могу к вам добраться!") // это тоже не работает, скорее всего эти комменты вообще тут не нужны
                //}
            }
            if (message === "$where") {
                const myPos = minecraft_bot.entity.position
                minecraft_bot.chat("Я нахожусь на координатах " + Math.round(myPos.x) + " " + Math.round(myPos.y) + " " + Math.round(myPos.z))
            }
            if (message === '$healthcheck') {
                minecraft_bot.chat('Статус: Бот активен.') // если он не будет активен, то он не сможет отправить это сообщение xD
            }
            //if (message === '$health') {
                //minecraft_bot.chat("У меня " + minecraft_bot.entity.health + " здоровья, и " + minecraft_bot.entity.food + " единиц голода.") // todo - починить команду (возвращает undefined на голоде и хп)
            //}
            //if (message === '$velocity') {
                //minecraft_bot.chat("В настоящий момент мое движение равно " + minecraft_bot.entity.velocity) // команды для дебага, если они вам нужны то можете расскоментировать
            //}
            if (message === '$help') {
                minecraft_bot.chat('|||  Help  |||')
                minecraft_bot.chat('$help - Отрывает это меню.')
                minecraft_bot.chat('$gotome - Бот идёт к вам.')
                minecraft_bot.chat('$healthcheck - Отчёт о статусе бота')
                minecraft_bot.chat('$where - Отправляет в чат координаты бота')
            } // убедитесь, что антиспам ему не помешает, потому-что сообщения эти он отправит очень быстро :)
        }
        if (username !== config.name && message !== "$gotome" && message !== "$healthcheck" && message !== "$help" && message !== "$where") {
            const msg = new webhook.MessageBuilder()
                .setName(`${username}`)
                .setText(`${message}`)
                .setAvatar(`https://minotar.net/helm/${username}`);
            hook.send(msg);
        }}); //эти проверки в if'е можно было сделать намного красивее через перебор массива команд, нооо...

} //конец функции инициализации бота майнкрафт

void client.login(config.discordToken); // запускаем дискорд бота
client.on("ready", function() {
    console.log(client.user.username + " запущен.");
    startMineflayerBot(mineflayer_config)
})
