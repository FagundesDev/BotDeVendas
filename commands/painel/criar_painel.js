const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const {ownerid} = require("../../config.json");
const emoji = require("../../emoji.json");
const { perm, db, db2 } = require("../../database/index");


module.exports = {
    name:"criar_painel",
    description:"Crie um Painel",
    type: ApplicationCommandType.ChatInput,
    options:[
        {
            name:"id",
            description:"Coloque o ID do Painel",
            type: ApplicationCommandOptionType.String,
            required:true
        },
        {
            name:"id_produto",
            description:"Coloque o ID do produto",
            type: ApplicationCommandOptionType.String,
            required:true
        },
    ],
    run: async(client, interaction) => {
        const userid = interaction.user.id
        if(!await perm.get(`${userid}`)) return interaction.reply({content:`Você não tem permissão!`, ephemeral:true});
        const id = interaction.options.getString("id");
        const id_produto = interaction.options.getString("id_produto");
        const prod = await db.get(`${id_produto}`);
        if(!prod) return interaction.reply({content:`Não existe um produto com este ID`, ephemeral:true});
        const p = await db2.get(`${id}`);
        if(p) return interaction.reply({content:`Já Existe um Painel com este ID`, ephemeral:true});

        await interaction.reply({
            content:`Aguarde um momento...`,
            ephemeral:true
        });
        const select = new StringSelectMenuBuilder()
        .setCustomId(`${id}_compra`)
        .setMaxValues(1)
        .addOptions(
            {
                label:`${prod.nome}`,
                description:`💸 | Preço: ${Number(prod.preco).toFixed(2)} - 📦 | Estoque: ${prod.conta.length}`,
                value:`${id_produto}`,
                emoji: emoji.cart
            }
        )
        .setPlaceholder("Escolha um Produto");
        await interaction.channel.send({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Painel`)
                .setDescription(`\`\`\` Sem Descrição \`\`\``)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    select
                )
            ]
        }).then(async() => {
            await db2.set(`${id}`, {
                title:`${interaction.guild.name} | Painel`,
                desc:"``` Sem Descrição ```",
                produtos:[`${id_produto}`],
                banner:"remover",
                placeholder:"Escolha um Produto"
            });
            interaction.editReply({
                content:`Criado com sucesso!`
            })
        })
    }
}