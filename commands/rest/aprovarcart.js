const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const {ownerid} = require("../../config.json");
const { bot, cart } = require("../../database/index");
const emoji = require("../../emoji.json");

module.exports = {
    name:"aprovarcart",
    description:"Aprovar Carrinho [Owner Only]",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if(interaction.user.id !== ownerid) return interaction.reply({content:`Apenas o Dono pode usar esta função`, ephemeral:true});
        const c = await cart.get(`${interaction.channel.id}`);
        if(!c) return interaction.reply({content:`Não encontrei o carrinho na DataBase`, ephemeral:true});

        await cart.set(`${interaction.channel.id}.status`, "aprovado");
        interaction.reply({content:`Carrinho aprovado com sucesso!`, ephemeral:true});
    }}