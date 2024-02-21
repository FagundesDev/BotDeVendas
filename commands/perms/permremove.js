const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const {ownerid} = require("../../config.json");
const { perm } = require("../../database/index");


module.exports = {
    name:"permaremove",
    description:"remova permissão em um usuario",
    type: ApplicationCommandType.ChatInput,
    options:[
        {
            name:"usuario",
            description:"Qual será o usuario que vai removido?",
            type: ApplicationCommandOptionType.User,
            required:true
        }
    ],
    run: async(client, interaction) => {
        if(interaction.user.id !== ownerid) return interaction.reply({content:`Apenas o Dono pode usar esta função`, ephemeral:true});
        const user = interaction.options.getUser("usuario");

        await perm.delete(`${user.id}`);
        interaction.reply({content:`O Usuario: ${user} foi removido com sucesso!`, ephemeral:true});

}}