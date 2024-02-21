const { JsonDatabase } = require("wio.db");
const bot = new JsonDatabase({databasePath:"./database/bot.json"});
const cart = new JsonDatabase({databasePath:"./database/carrinho.json"});
const db2 = new JsonDatabase({databasePath:"./database/paineis.json"});
const perm = new JsonDatabase({databasePath:"./database/perm.json"});
const db = new JsonDatabase({databasePath:"./database/produtos.json"});



module.exports.bot = bot;
module.exports.cart = cart;
module.exports.db2 = db2;
module.exports.perm = perm;
module.exports.db = db;