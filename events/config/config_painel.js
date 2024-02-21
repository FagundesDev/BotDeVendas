const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType } = require("discord.js");
const {ownerid} = require("../../config.json");
const { bot, db, db2 } = require("../../database/index");
const emoji = require("../../emoji.json");
const fs = require("fs");



module.exports = {
    name:"interactionCreate",
    run:async(interaction, client) => {
        const {customId} = interaction;
        if(!customId) return;
        const userid = customId.split("_")[0];
        const id = customId.split("_")[1];
        if(interaction.user.id !== userid) return;
        if(!id) return;
        const p = await db2.get(`${id}`);
        if(!p) return;
        

    
        if(customId.endsWith("_addproductpainel")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_addproductpainelmodal`)
            .setTitle("Adicionar Produto");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("coloque o ID do produto")
            .setStyle(1)
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if(customId.endsWith("_addproductpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const a = await db.get(`${text}`);
            if(!a) return interaction.reply({content:`Não existe este produto!`, ephemeral:true});
            if(p.produtos?.includes(`${text}`)) return interaction.reply({content:`Este Produto já foi cadastrado!`, ephemeral:true});
            await db2.push(`${id}.produtos`, text);
            config();
        }
        if(customId.endsWith("_removeproductpainel")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_removeproductpainelmodal`)
            .setTitle("Remover Produto");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("coloque o ID do produto")
            .setStyle(1)
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if(customId.endsWith("_removeproductpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const a = await db.get(`${text}`);
            if(!a) return interaction.reply({content:`Não existe este produto!`, ephemeral:true});
            if(!p.produtos?.includes(`${text}`)) return interaction.reply({content:`Este Produto não é cadastrado!`, ephemeral:true});
            await db2.pull(`${id}.produtos`, (element, index, array) => element === text, true);
            config();
        }
        if(customId.endsWith("_titlepainel")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_titlepainelmodal`)
            .setTitle(`Alterar Titulo`);

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("Coloque o novo titulo:")
            .setStyle(1)
            .setRequired(true)
            .setPlaceholder("Coloca essa buceta logo");

            modal.addComponents(new ActionRowBuilder().addComponents(text));
            
            return interaction.showModal(modal);
        }

        if(customId.endsWith("_titlepainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            await db2.set(`${id}.title`, text);
            config()
        } //
        if(customId.endsWith("_descpainel")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_descpainelmodal`)
            .setTitle(`Alterar Descrição`);

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("Coloque a nova descrição:")
            .setStyle(2)
            .setRequired(true)
            .setPlaceholder("Coloca essa buceta logo");

            modal.addComponents(new ActionRowBuilder().addComponents(text));
            
            return interaction.showModal(modal);
        }

        if(customId.endsWith("_descpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            await db2.set(`${id}.desc`, text);
            config()
        }// 
        if(customId.endsWith("_placeholderpainel")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_placeholderpainelmodal`)
            .setTitle(`Alterar PlaceHolder`);

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("Coloque o novo placeholder:")
            .setStyle(1)
            .setRequired(true)
            .setPlaceholder("Coloca essa buceta logo");

            modal.addComponents(new ActionRowBuilder().addComponents(text));
            
            return interaction.showModal(modal);
        }

        if(customId.endsWith("_placeholderpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            await db2.set(`${id}.placeholder`, text);
            config()
        }//

        if(customId.endsWith("_bannerpainel")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_bannerpainelmodal`)
            .setTitle("Alterar Banner");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setStyle(1)
            .setPlaceholder('ei idiota digita "removr" para tirar')
            .setLabel("Coloque a URL de um banner:");

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if(customId.endsWith("_bannerpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            if(text === "remover") {
                await db2.set(`${id}.banner`, text);
                config();
            } else {
                await interaction.reply({
                    content:`Estou Verificando esse banner podre ai`,
                    ephemeral:true
                });

                try {
                    interaction.editReply({
                        content:`${interaction.user}`,
                        embeds:[
                            new EmbedBuilder()
                            .setDescription("Ai o seu novo banner")
                            .setImage(text)
                        ]
                    }).then(async() => {
                        await db2.set(`${id}.banner`, text);
                        configedit();
                    }).catch(() => {
                        interaction.editReply({content:`Coloque uma imagem valida!`});
                    })
                } catch {
                    interaction.editReply({content:`Coloque uma imagem valida!`});
                }
            }
        }

        async function config() {


            const p = await db2.get(`${id}`);
        if(!p) return interaction.reply({content:`Não Existe um Painel com este ID`, ephemeral:true});
        let banner = "`Sem Banner`"
        if(p.banner?.startsWith("https://")) {
            banner = `[Banner](${p.banner})`
        }
        const embed = new EmbedBuilder()
        .setTitle(`${interaction.guild.name} | Configurar Painel`)
        .setThumbnail(interaction.guild.iconURL())
        .setDescription(`**Descrição Atual:**\n ${p.desc} \n\n🔎 | ID: ${id}\n${emoji.chavefenda} | Titulo: ${p.title} \n${emoji.ferra} | PlaceHolder: ${p.placeholder}\n${emoji.paleta} | ${banner} \n\n **TODOS OS PRODUTOS:**\n`);
        await p.produtos.map((a) => {
            embed.addFields({
                name:`Produto ID:`,
                value:`${a}`,
                inline:true
            })
        });
        interaction.update({
            embeds:[
                embed
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${userid}_${id}_addproductpainel`)
                        .setLabel("ADICIONAR PRODUTO")
                        .setEmoji(emoji.mais)
                        .setDisabled(p.produtos.length > 24)
                        .setStyle(3),
                        new ButtonBuilder()
                        .setCustomId(`${userid}_${id}_removeproductpainel`)
                        .setLabel("REMOVER PRODUTO")
                        .setEmoji(emoji.menos)
                        .setDisabled(p.produtos.length <= 1)
                        .setStyle(2),
                ),
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${userid}_${id}_titlepainel`)
                    .setLabel("Alterar Titulo")
                    .setStyle(1)
                    .setEmoji(emoji.engrenagem),
                    new ButtonBuilder()
                    .setCustomId(`${userid}_${id}_descpainel`)
                    .setLabel("Alterar Descrição")
                    .setStyle(1)
                    .setEmoji(emoji.engrenagem),
                ),
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${userid}_${id}_placeholderpainel`)
                    .setLabel("Alterar PlaceHolder")
                    .setStyle(1)
                    .setEmoji(emoji.engrenagem),
                    new ButtonBuilder()
                    .setCustomId(`${userid}_${id}_bannerpainel`)
                    .setLabel("Alterar Banner")
                    .setStyle(1)
                    .setEmoji(emoji.engrenagem),
                )
            ]
        })
        }
        async function configedit() {


            const p = await db2.get(`${id}`);
        if(!p) return interaction.reply({content:`Não Existe um Painel com este ID`, ephemeral:true});
        let banner = "`Sem Banner`"
        if(p.banner?.startsWith("https://")) {
            banner = `[Banner](${p.banner})`
        }
        const embed = new EmbedBuilder()
        .setTitle(`${interaction.guild.name} | Configurar Painel`)
        .setThumbnail(interaction.guild.iconURL())
        .setDescription(`**Descrição Atual:**\n ${p.desc} \n\n🔎 | ID: ${id}\n${emoji.chavefenda} | Titulo: ${p.title} \n${emoji.ferra} | PlaceHolder: ${p.placeholder}\n${emoji.paleta} | ${banner} \n\n **TODOS OS PRODUTOS:**\n`);
        await p.produtos.map((a) => {
            embed.addFields({
                name:`Produto ID:`,
                value:`${a}`,
                inline:true
            })
        });
        interaction.message.edit({
            embeds:[
                embed
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${userid}_${id}_addproductpainel`)
                        .setLabel("ADICIONAR PRODUTO")
                        .setEmoji(emoji.mais)
                        .setDisabled(p.produtos.length > 24)
                        .setStyle(3),
                        new ButtonBuilder()
                        .setCustomId(`${userid}_${id}_removeproductpainel`)
                        .setLabel("REMOVER PRODUTO")
                        .setEmoji(emoji.menos)
                        .setDisabled(p.produtos.length <= 1)
                        .setStyle(2),
                ),
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${userid}_${id}_titlepainel`)
                    .setLabel("Alterar Titulo")
                    .setStyle(1)
                    .setEmoji(emoji.engrenagem),
                    new ButtonBuilder()
                    .setCustomId(`${userid}_${id}_descpainel`)
                    .setLabel("Alterar Descrição")
                    .setStyle(1)
                    .setEmoji(emoji.engrenagem),
                ),
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${userid}_${id}_placeholderpainel`)
                    .setLabel("Alterar PlaceHolder")
                    .setStyle(1)
                    .setEmoji(emoji.engrenagem),
                    new ButtonBuilder()
                    .setCustomId(`${userid}_${id}_bannerpainel`)
                    .setLabel("Alterar Banner")
                    .setStyle(1)
                    .setEmoji(emoji.engrenagem),
                )
            ]
        })
        }
    }}