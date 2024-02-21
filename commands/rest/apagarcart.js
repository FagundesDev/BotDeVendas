const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const {ownerid} = require("../../config.json");
const emoji = require("../../emoji.json");
const { perm, db, cart } = require("../../database/index");


module.exports = {
    name:"apagarcarrinho",
    description:"Apague um carrinho",
    type: ApplicationCommandType.ChatInput,
    options:[
        {
            name:"canal",
            description:"Escolha o Carrinho que deseja apagar",
            type: ApplicationCommandOptionType.Channel,
            required:true
        }
    ],
    run: async(client, interaction) => {
        const userid = interaction.user.id
        if(!await perm.get(`${userid}`)) return interaction.reply({content:`Você não tem permissão!`, ephemeral:true});
        const channel = interaction.options.getChannel("canal");

        const c = await cart.get(`${channel.id}`);
        if(!c) return interaction.reply({content:`Não encontrei o carrinho na DataBase`, ephemeral:true});
        await channel.delete();
        await cart.delete(`${channel.id}`);
        interaction.reply({content:`Carrinho Deletado com sucesso!`});
    }}