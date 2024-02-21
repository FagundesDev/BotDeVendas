const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const {ownerid} = require("../../config.json");
const { bot } = require("../../database/index");
const emoji = require("../../emoji.json");

module.exports = {
    name:"botconfig",
    description:"Configure o Sistema de Vendas",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if(interaction.user.id !== ownerid) return interaction.reply({content:`Apenas o Dono pode usar esta função`, ephemeral:true});
        const userid = interaction.user.id;
        interaction.reply({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | BotConfig`)
                .setDescription(`Olá ***${interaction.user.username}*** Selecione abaixo qual opção você deseja configurar`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${userid}_vendasonoff`)
                    .setEmoji(emoji.cart)
                    .setLabel(`Vendas ${bot.get(`vendas`) === true ? "Online" : "Offline"}`)
                    .setStyle(bot.get(`vendas`) === true ? 3 : 4),
                    new ButtonBuilder()
                    .setCustomId(`${userid}_payments`)
                    .setLabel("Configurar Pagamentos") 
                    .setEmoji(emoji.mao)
                    .setStyle(1),
                    new ButtonBuilder()
                    .setCustomId(`${userid}_roles`)
                    .setLabel("Configurar Cargo Cliente")
                    .setEmoji(emoji.engrenagem)
                    .setStyle(1),
                    new ButtonBuilder()
                    .setCustomId(`${userid}_channels`)
                    .setLabel("Configurar Canal")
                    .setEmoji(emoji.engrenagem)
                    .setStyle(1),
                    new ButtonBuilder()
                    .setCustomId(`${userid}_terms`)
                    .setEmoji(emoji.papel)
                    .setLabel("Configurar Termos")
                    .setStyle(1),
                )
            ]
        })
    }
}