const fs = require('fs')

module.exports = {
    run: (client) => {
        fs.readdirSync('./events/').forEach(folder => {
            const arquivosEvent = fs.readdirSync(`./events/${folder}`).filter(archive => archive.endsWith('.js'))
        for (const arquivo of arquivosEvent) {
            const evento = require(`../events/${folder}/${arquivo}`);
            if (evento.once) {
                client.once(evento.name, (...args) => evento.run(...args, client));
            } else {
                client.on(evento.name, (...args) => evento.run(...args, client));
            }
        }
    })
  }
}