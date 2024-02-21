const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const {ownerid} = require("../../config.json");
const emoji = require("../../emoji.json");
const { perm, db, db2 } = require("../../database/index");


module.exports = {
    name:"set_painel",
    description:"Sete um Painel",
    type: ApplicationCommandType.ChatInput,
    options:[
        {
            name:"id",
            description:"Coloque o ID do Painel",
            type: ApplicationCommandOptionType.String,
            required:true
        },
    ],
    run: async(client, interaction) => {
        const userid = interaction.user.id
        if(!await perm.get(`${userid}`)) return interaction.reply({content:`Você não tem permissão!`, ephemeral:true});
        const id = interaction.options.getString("id");
        const p = await db2.get(`${id}`);
        if(!p) return interaction.reply({content:`Não Existe um Painel com este ID`, ephemeral:true});

        await interaction.reply({
            content:`Aguarde um momento...`,
            ephemeral:true
        });
        const select = new StringSelectMenuBuilder()
        .setCustomId(`${id}_compra`)
        .setPlaceholder(`${p.placeholder}`)
        .setMaxValues(1);

        const embed = new EmbedBuilder()
        .setTitle(`${p.title}`)
        .setDescription(`${p.desc}`);

        await p.produtos.map((r) => {
            const prod = db.get(`${r}`);
            if(prod) {
                select.addOptions(
                    {
                        label:`${prod.nome}`,
                        description:`💸 | Preço: ${Number(prod.preco).toFixed(2)} - 📦 | Estoque: ${prod.conta.length}`,
                        value:`${r}`,
                        emoji: emoji.cart
                    }
                )
            }
        });
        if(p.banner?.startsWith("https://")) {
            embed.setImage(p.banner);
        }

        return await interaction.channel.send({
            embeds:[
                embed
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    select
                )
            ]
        }).then(async() => {

            interaction.editReply({
                content:`Setado com sucesso!`
            })
        })
    }
}