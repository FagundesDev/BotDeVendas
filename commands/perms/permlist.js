const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const {ownerid} = require("../../config.json");
const { perm } = require("../../database/index");


module.exports = {
    name:"permlist",
    description:"veja a lista de quem tem permissão",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if(interaction.user.id !== ownerid) return interaction.reply({content:`Apenas o Dono pode usar esta função`, ephemeral:true});
        let msg = "";
        const a = await perm.all();

        await a.forEach((p, index) => {
            msg += `- ${index + 1}° - <@${p}> (\`${p}\`)\n`
        });
        interaction.reply({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Perm List`)
                .setDescription(`Logo Abaixo está a lista de permissão:\n\n${msg}`)
            ],
            ephemeral:true
        })

}}