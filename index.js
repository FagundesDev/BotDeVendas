const {Client , GatewayIntentBits,Collection, Partials } = require("discord.js");
console.clear()
console.log("\x1b[37m                                                                                           ");
console.log("\x1b[37m                                                                                           ");
console.log("\x1b[37m                                                                                           ");
console.log("\x1b[37m                                                                                           ");
console.log("\x1b[37m                                ______                            __                                   ");
console.log("\x1b[37m                               / ____/___ _____ ___  ______  ____/ /__  _____                          ");
console.log("\x1b[37m                              / /_  / __ `/ __ `/ / / / __ \/ __  / _ \/ ___/                          ");
console.log("\x1b[37m                             / __/ / /_/ / /_/ / /_/ / / / / /_/ /  __(__  )                           ");
console.log("\x1b[37m                            /_/    \__,_/\__, /\__,_/_/ /_/\__,_/\___/____/                            ");
console.log("\x1b[37m                                        /____/                                                         ");
console.log("\x1b[37m                               > Feito por FagundesDev <                                 ");
console.log("\x1b[37m                               > BOT DE VENDAS V2.0.0 <                                ");
console.log("\x1b[37m                               > https://discord.gg/FFPmfbtpa9 <                                ");
console.log("\x1b[37m v2.0.0                                                                             \n\n");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
    ],

    partials: [
        Partials.Message,
        Partials.Channel
    ]
  });

module.exports = client;

client.slashCommands = new Collection();

const {token} = require("./token.json");

client.login(token);

const evento = require("./handler/Events");

evento.run(client);

require("./handler/index")(client);

process.on('unhandRejection', (reason, promise) => {
    console.log(`🚫 Erro Detectado:\n\n` + reason, promise)
});

process.on('uncaughtException', (error, origin) => {
    console.log(`🚫 Erro Detectado:\n\n` + error, origin)
});
