const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, PermissionFlagsBits, AttachmentBuilder } = require("discord.js");
const {ownerid} = require("../../config.json");
const { bot, db, db2,cart } = require("../../database/index");
const emoji = require("../../emoji.json");
const fs = require("fs");
const axios = require("axios");
const mercadopago = require("mercadopago");

module.exports = {
    name:"interactionCreate",
    run:async(interaction, client) => {
        const {customId} = interaction;
        if(!customId) return;
        const userid = interaction.user.id;

        if(customId.endsWith("_compra")) {
            let id = customId.split("_")[0];
            if(interaction.isStringSelectMenu()) {
                id = interaction.values[0];
                const p = await db2.get(`${id}`);

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

        await interaction.message.edit({
            embeds:[
                embed
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    select
                )
            ]
        })
            } else {
                const prod = await db.get(`${id}`);
        const embed = new EmbedBuilder()
        .setTitle(`${prod.title}`)
        .setDescription(`${prod.description} \n${emoji.planeta} **| Produto:** ${prod.nome} \n${emoji.dinheiro} **| Preço:** \`R$${Number(prod.preco).toFixed(2)}\`\n${emoji.caixa} **| Estoque:** \`${prod.conta.length}\``);

        if(prod.banner?.startsWith("https://")) {
            embed.setImage(prod.banner);
        }
        await interaction.message.edit({
            embeds:[
                embed
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${id}_compra`)
                    .setLabel("Compra")
                    .setStyle(3)
                    .setEmoji(emoji.cart)
                )
            ]
        })
            }
            const channel = interaction.guild.channels.cache.find(a => a.topic === `carrinho - ${interaction.user.id}`);
            if(channel) {
                interaction.reply({
                    content:`Você ja tem um carrinho aberto!`,
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setURL(channel.url)
                            .setStyle(5)
                            .setLabel("Ir para o carrinho")
                            .setEmoji(emoji.cart)
                        )
                    ],
                    ephemeral:true
                });
                return;
            }
            const prod = await db.get(`${id}`);
            if(prod.conta.length <= 0) return interaction.reply({content:`${emoji.aviso} | Este Produto não tem estoque!`, ephemeral:true});
            await interaction.reply({
                content:`${emoji.carregar} | Aguarde um momento estou criando seu carrinho...`,
                ephemeral:true
            });

            const permission = [
                {
                    id: interaction.user.id,
                    allow:["ViewChannel"],
                    deny:["SendMessages"]
                },
                {
                    id: interaction.guild.id,
                    deny:["SendMessages", "ViewChannel"]
                },
            ]
            const role = interaction.guild.roles.cache.get(await bot.get(`semiauto.role`));
            if(role) {
                permission.push({
                    id: role.id,
                    allow:["ViewChannel", "SendMessages"],
                });
            }
            await interaction.guild.channels.create({
                name:`🛒-${interaction.user.username}`,
                topic:`carrinho - ${interaction.user.id}`,
                permissionOverwrites: permission,
                parent: await bot.get("category") || interaction.channel.parent
            }).then(async(channel) => {
                await channel.send({
                    content:`${interaction.user}`,
                    embeds:[
                        new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Sistema de Compra`)
                        .setDescription(`${emoji.ola} | Olá ${interaction.user}, Seja Bem-Vindo ao seu Carrinho de Compras!\n\n${emoji.aviso} | Lembre-se de Ver os Termos, ele é muito importante para uma melhor convivencia, entre você e a nossa equipe evitar futuros Problemas, Também Verifique se uma DM está Desbloqueada! \n\n${emoji.duvida} | Caso você queira ver as informações das compras elas estarão logos abaixos! \n\n${emoji.buzina} | Caso você clique em continuar você automaticamente aceita os nossos termos!\n\nㅤ`)
                        .setThumbnail(interaction.guild.iconURL())
                        .setFooter({text:"copyright - @Correa10K"})
                        .addFields(
                            {
                                name:`${emoji.planeta} | Produto:`,
                                value:`${prod.nome}`,
                                inline:true
                            },
                            {
                                name:`${emoji.dinheiro} | Valor:`,
                                value:`\`R$${Number(prod.preco).toFixed(2)}\``,
                                inline:true
                            },
                            {
                                name:`${emoji.caixa} | Estoque:`,
                                value:`\`${prod.conta.length}\``,
                                inline:true
                            },
                            {
                                name:`${emoji.lapis} | Quantidade:`,
                                value:`x\`1\``,
                                inline:true
                            },
                            {
                                name:`${emoji.prancheta} | Descrição:`,
                                value:`${prod.description}`,
                                inline:true
                            },
                            {
                                name:`${emoji.dinheiro2} | total a Pagar:`,
                                value:`\`R$${Number(prod.preco).toFixed(2)}\``,
                                inline:true
                            },
                        )
                    ],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId(`${interaction.user.id}_addcart`)
                            .setEmoji(emoji.mais)
                            .setStyle(2),
                            new ButtonBuilder()
                            .setCustomId(`${interaction.user.id}_removercart`)
                            .setEmoji(emoji.menos)
                            .setStyle(2),
                            new ButtonBuilder()
                            .setCustomId(`${interaction.user.id}_confirmcart`)
                            .setEmoji(emoji.sim)
                            .setLabel("Aceitar e Continuar")
                            .setStyle(3),
                            new ButtonBuilder()
                            .setCustomId(`${interaction.user.id}_termscart`)
                            .setEmoji(emoji.mao)
                            .setLabel("Nossos Termos")
                            .setStyle(1),
                            new ButtonBuilder()
                            .setCustomId(`${interaction.user.id}_cancelcart`)
                            .setEmoji(emoji.nao)
                            .setStyle(4),
                        )
                    ]
                });
                const cha = interaction.guild.channels.cache.get(await bot.get("channel_logs"));
                if(cha) {
                    cha.send({
                        embeds:[
                            new EmbedBuilder()
                            .setTitle(`${interaction.guild.name} | Sistema de Logs`)
                            .setColor("Random")
                            .addFields(
                                {
                                    name:`${emoji.user} | Usuario:`,
                                    value:`${interaction.user} - (\`${interaction.user.id}\`)`
                                },
                                {
                                    name:`${emoji.cart} | Carrinho`,
                                    value:`Cart ID: ${channel.id}`
                                },
                                {
                                    name:`${emoji.horario} | Horario de Abertura:`,
                                    value:`<t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date() / 1000)}:R>)`
                                }
                            )
                        ]
                    })
                }
                await cart.set(`${channel.id}`, {
                    user: interaction.user.id,
                    produto: id,
                    quantia: 1,
                    status:"pendente"
                });
                interaction.editReply({
                    content:`${emoji.sim} | Carrinho Criado com sucesso!`, 
                    components:[
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setStyle(5)
                        .setURL(`${channel.url}`)
                        .setLabel("Ir para o Carrinho"))
                    ]
                });
            });
        }
        if(customId.endsWith("_confirmcart")) {
            if(userid !== customId.split("_")[0]) return interaction.deferUpdate();
            const carrinho = await cart.get(`${interaction.channel.id}`);
            const prod = await db.get(`${carrinho.produto}`);
            interaction.channel.bulkDelete(4).then(async() => {
                const msg = await interaction.channel.send({
                    content:`${emoji.carregar} | Aguarde um momento...`
                });
                if(await bot.get("semi") === true) {
                    await msg.delete();
                    const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId("pix_semiauto")
                        .setLabel("Pix")
                        .setStyle(1)
                        .setEmoji(emoji.pix),
                    );
                    const permission = [
                        {
                            id: interaction.user.id,
                            allow:["ViewChannel", PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles],
                        },
                        {
                            id: interaction.guild.id,
                            deny:["SendMessages", "ViewChannel"]
                        },
                    ]
                    const role = interaction.guild.roles.cache.get(await bot.get(`semiauto.role`));
                    if(role) {
                        permission.push({
                            id: role.id,
                            allow:["ViewChannel", "SendMessages"],
                        });
                    }
                    await interaction.channel.edit({permissionOverwrites: permission});

                    if(await bot.get(`semiauto.qrcode`)?.startsWith("https://")) {
                        row.addComponents(
                            new ButtonBuilder()
                            .setCustomId("qrcode_semiauto")
                            .setLabel("QrCode")
                            .setStyle(1)
                            .setEmoji(emoji.pix),
                        )
                    }
                    row.addComponents(
                        new ButtonBuilder()
                        .setCustomId(`aprovarcart`)
                        .setEmoji(emoji.ferra)
                        .setLabel("Aprovar Carrinho (Staff)")
                        .setStyle(3),
                    )
                    row.addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${interaction.user.id}_cancelcart`)
                        .setEmoji(emoji.nao)
                        .setStyle(4),
                    )
                    interaction.channel.send({
                        embeds:[
                            new EmbedBuilder()
                            .setTitle(`${interaction.guild.name} | Resumo da Compra`)
                            .addFields(
                                {
                                    name:`${emoji.planeta} | Produto:`,
                                    value:`${prod.nome}`,
                                    inline:true
                                },
                                {
                                    name:`${emoji.dinheiro} | Valor:`,
                                    value:`\`R$${Number(prod.preco).toFixed(2)}\``,
                                    inline:true
                                },
                                {
                                    name:`${emoji.caixa} | Estoque:`,
                                    value:`\`${prod.conta.length}\``,
                                    inline:true
                                },
                                {
                                    name:`${emoji.lapis} | Quantidade:`,
                                    value:`x\`${carrinho.quantia}\``,
                                    inline:true
                                },
                                {
                                    name:`${emoji.prancheta} | Descrição:`,
                                    value:`${prod.description}`,
                                    inline:true
                                },
                                {
                                    name:`${emoji.dinheiro2} | total a Pagar:`,
                                    value:`\`R$${Number(prod.preco).toFixed(2) * carrinho.quantia}\``,
                                    inline:true
                                },
                            )
                        ],
                        components:[
                            row
                        ]
                    })
                } else {
                    const row = new ActionRowBuilder();
    
                    if(!await bot.get("pix") && !await bot.get("qrcode") && !await bot.get("pagarsite")) {
                        row.addComponents(
                                new ButtonBuilder()
                                .setCustomId(`${userid}_lindademais`)
                                .setStyle(1)
                                .setEmoji(emoji.pix)
                                .setLabel("PIX")
                            
                        )
                    } else {
                        if(await bot.get("pix") && await bot.get("qrcode") || await bot.get("pix")) {
                            row.addComponents(
                                    new ButtonBuilder()
                                    .setCustomId(`${userid}_lindademais`)
                                    .setStyle(1)
                                    .setEmoji(emoji.pix)
                                    .setLabel("PIX")
                                
                            )
                        }
                        if(await bot.get("pagarsite")) {
                            row.addComponents(
                                    new ButtonBuilder()
                                    .setCustomId(`${userid}_lindademais123`)
                                    .setStyle(1)
                                    .setEmoji(emoji.mercadopago)
                                    .setLabel("PAGAR NO SITE")
                            )
                        }
                    }
                    row.addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${interaction.user.id}_cancelcart`)
                        .setEmoji(emoji.nao)
                        .setStyle(4),
                    )
                    msg.edit({
                        content:`${interaction.user}`,
                        embeds:[
                            new EmbedBuilder()
                            .setDescription(`${emoji.lupa} | Qual Será a forma de Pagamento?`)
                        ],
                        components:[
                            row
                        ]
                        
                    })
                }
            })
        }
        if(customId.endsWith("_lindademais")){
            if(userid !== customId.split("_")[0]) return interaction.deferUpdate();
            const carrinho = await cart.get(`${interaction.channel.id}`);
            const prod = await db.get(`${carrinho.produto}`);
            const user = interaction.client.users.cache.get(`${carrinho.user}`);
            const member = interaction.guild.members.cache.get(`${carrinho.user}`);
            const valor = Number(prod.preco).toFixed(2) * carrinho.quantia;
            await interaction.update({
                content:`${emoji.aviso} | Aguarde estou gerando o pagamento...`,
                embeds:[],
                components:[]
            })
            mercadopago.configurations.setAccessToken(await bot.get('acesstoken'))
            var payment_data = {
                transaction_amount: valor,
                description: `carrinho do usuario - ${interaction.user.username}`,
                payment_method_id: 'pix',
                payer: {
                    email: 'clienteinbiza@gmail.com',
                    first_name: 'Paula',
                    last_name: 'Guimaraes',
                    identification: {
                    type: 'CPF',
                    number: '07944777984'
                },
                address: {
                    zip_code: '06233200',
                    street_name: 'Av. das NaÃƒÂ§oes Unidas',
                    street_number: '3003',
                    neighborhood: 'Bonfim',
                    city: 'Osasco',
                    federal_unit: 'SP'
                }
               },
               notification_url: interaction.user.displayAvatarURL(),
           };
           mercadopago.payment.create(payment_data).then(function (data) {
 
            const buffer = Buffer.from(data.body.point_of_interaction.transaction_data.qr_code_base64, "base64");
            const attachment = new AttachmentBuilder(buffer, "payment.png");
           
            const row = new ActionRowBuilder();
            if(bot.get("pix")) {
                row.addComponents(
                    new ButtonBuilder()
                     .setLabel('Pix Copia e Cola')
                     .setEmoji(emoji.pix)
                     .setCustomId('cpc')
                     .setDisabled(false)
                     .setStyle(1),
                     )
            }
            if(bot.get("qrcode")) {
                row.addComponents(
                    new ButtonBuilder()
                     .setLabel('Qr Code')
                     .setEmoji(emoji.paleta)
                     .setCustomId('qrc')
                     .setDisabled(false)
                     .setStyle(1),
                     )
            }

            row.addComponents(
                new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_cancelcart`)
                .setEmoji(emoji.nao)
                .setStyle(4),
                )
            
            const embed = new EmbedBuilder()
             .setTitle(`${interaction.guild.name} | Sistema de pagamento`)
             .addFields(
                {
                    name:`${emoji.planeta} | Produto:`,
                    value:`${prod.nome}`,
                    inline:true
                },
                {
                    name:`${emoji.dinheiro} | Valor:`,
                    value:`\`R$${Number(prod.preco).toFixed(2)}\``,
                    inline:true
                },
                {
                    name:`${emoji.caixa} | Estoque:`,
                    value:`\`${prod.conta.length}\``,
                    inline:true
                },
                {
                    name:`${emoji.lapis} | Quantidade:`,
                    value:`x\`${carrinho.quantia}\``,
                    inline:true
                },
                {
                    name:`${emoji.prancheta} | Descrição:`,
                    value:`${prod.description}`,
                    inline:true
                },
                {
                    name:`${emoji.dinheiro2} | total a Pagar:`,
                    value:`\`R$${Number(prod.preco).toFixed(2) * carrinho.quantia}\``,
                    inline:true
                },
            )
             .setColor("Random")
             
             interaction.editReply({ content: ``, embeds: [embed], components: [row], ephemeral: true }).then(msg => {
                 
                 const filter = i => i.member.id === interaction.user.id;
                 const collector = msg.createMessageComponentCollector({ filter });
                 collector.on('collect', interaction2 => {
                     
                     if (interaction2.customId == 'cpc') {
                       interaction2.reply({ content: `${data.body.point_of_interaction.transaction_data.qr_code}`, ephemeral: true });
                     }
                     
                     if (interaction2.customId == 'qrc') {
                       interaction2.reply({ files: [attachment], ephemeral: true });
                     }
                 }) 
                 
                 const checkPaymentStatus = setInterval(() => {
                   axios.get(`https://api.mercadolibre.com/collections/notifications/${data.body.id}`, {
                     headers: {
                       'Authorization': `Bearer ${bot.get(`acesstoken`)}`
                     }
                  }).then(async (doc) => {
                    const status = await cart.get(`${interaction.channel.id}.status`);
                    if(status === "pendente") {
                        if (doc.data.collection.status === "approved") {
                            clearInterval(checkPaymentStatus);
                            await cart.set(`${interaction.channel.id}.status`, "aprovado");
                          }
                    }
                    if(status === "aprovado") {
                        clearInterval(checkPaymentStatus);
                        aprovved(data.body.id);
                    }
                      
                  })
                 }, 2000)
             })
          })
        }
        if(customId.endsWith("_lindademais123")){
            if(userid !== customId.split("_")[0]) return interaction.deferUpdate();
            const carrinho = await cart.get(`${interaction.channel.id}`);
            const prod = await db.get(`${carrinho.produto}`);
            const user = interaction.client.users.cache.get(`${carrinho.user}`);
            const member = interaction.guild.members.cache.get(`${carrinho.user}`);
            const valor = Number(prod.preco).toFixed(2) * carrinho.quantia;
            await interaction.update({
                content:`${emoji.aviso} | Aguarde estou gerando o pagamento...`,
                embeds:[],
                components:[]
            })
            mercadopago.configurations.setAccessToken(await bot.get('acesstoken'))
            var payment_data = {
                transaction_amount: valor,
                description: `carrinho do usuario - ${interaction.user.username}`,
                payment_method_id: 'pix',
                payer: {
                    email: 'clienteinbiza@gmail.com',
                    first_name: 'Paula',
                    last_name: 'Guimaraes',
                    identification: {
                    type: 'CPF',
                    number: '07944777984'
                },
                address: {
                    zip_code: '06233200',
                    street_name: 'Av. das NaÃƒÂ§oes Unidas',
                    street_number: '3003',
                    neighborhood: 'Bonfim',
                    city: 'Osasco',
                    federal_unit: 'SP'
                }
               },
               notification_url: interaction.user.displayAvatarURL(),
           };
           mercadopago.payment.create(payment_data).then(function (data) {
 
           
            const row = new ActionRowBuilder();
            row.addComponents(
                new ButtonBuilder()
                .setStyle(5)
                .setEmoji(emoji.mercadopago)
                .setLabel("Pagar no Site")
                .setURL(data.body.point_of_interaction.transaction_data.ticket_url)
            )
            row.addComponents(
                    new ButtonBuilder()
                .setCustomId(`verificarpagamento`)
                .setEmoji(emoji.sim)
                .setLabel("Verificar Pagamento")
                .setStyle(2),
                )
            
            const embed = new EmbedBuilder()
             .setTitle(`${interaction.guild.name} | Sistema de pagamento`)
             .addFields(
                {
                    name:`${emoji.planeta} | Produto:`,
                    value:`${prod.nome}`,
                    inline:true
                },
                {
                    name:`${emoji.dinheiro} | Valor:`,
                    value:`\`R$${Number(prod.preco).toFixed(2)}\``,
                    inline:true
                },
                {
                    name:`${emoji.caixa} | Estoque:`,
                    value:`\`${prod.conta.length}\``,
                    inline:true
                },
                {
                    name:`${emoji.lapis} | Quantidade:`,
                    value:`x\`${carrinho.quantia}\``,
                    inline:true
                },
                {
                    name:`${emoji.prancheta} | Descrição:`,
                    value:`${prod.description}`,
                    inline:true
                },
                {
                    name:`${emoji.dinheiro2} | total a Pagar:`,
                    value:`\`R$${Number(prod.preco).toFixed(2) * carrinho.quantia}\``,
                    inline:true
                },
            )
             .setColor("Random")
             
             interaction.editReply({ content: ``, embeds: [embed], components: [row], ephemeral: true }).then(msg => {
                 
                 const filter = i => i.member.id === interaction.user.id;
                 const collector = msg.createMessageComponentCollector({ filter });
                 collector.on('collect', interaction2 => {
                     
                     if (interaction2.customId == 'verificarpagamento') {
                        try {
                            axios.get(`https://api.mercadolibre.com/collections/notifications/${data.body.id}`, {
                            headers: {
                              'Authorization': `Bearer ${bot.get(`acesstoken`)}`
                            }
                         }).then(async (doc) => {
                           const status = await cart.get(`${interaction.channel.id}.status`);
                           if(status === "pendente") {
                               if (doc.data.collection.status === "approved") {
                                   await cart.set(`${interaction.channel.id}.status`, "aprovado");
                                 } else {
                                    interaction2.reply({content:`${emoji.nao} | Pagamento ainda está pendente!`, ephemeral:true});
                                 }
                           }
                           if(status === "aprovado") {
                               aprovved(data.body.id);
                           }
                             
                         })
                        } catch {
                            interaction2.reply({content:`${emoji.nao} | Pagamento ainda está pendente!`, ephemeral:true});
                        }
                     }
                 }) 
                 
             })
          })
        }
        if(customId === "aprovarcart") {
            const role = await interaction.guild.roles.cache.get(await bot.get("semiauto.role"));
            
            if(!interaction.member.roles.cache.has(`${role.id}`)) return interaction.deferUpdate();
            interaction.reply({content:`${emoji.sim} | Carrinho Aprovado com sucesso!`, ephemeral:true});
            await aprovved();
        }
        if(customId === "pix_semiauto") {
            await interaction.reply({
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`${interaction.guild.name} | Sistema de PIX`)
                    .addFields(
                        {
                            name:`${emoji.chave} | Chave Pix:`,
                            value:`${await bot.get(`semiauto.pix`)}`
                        },
                        {
                            name:`${emoji.lupa} | Tipo:`,
                            value:`${await bot.get(`semiauto.tipo`)}`
                        },
                    )
                ],
                ephemeral:true
            })
        }
        if(customId === "qrcode_semiauto") {
            await interaction.reply({
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`${interaction.guild.name} | Sistema de PIX`)
                    .setImage(await bot.get("semiauto.qrcode"))
                ],
                ephemeral:true
            })
        }
        if(customId.endsWith("_cancelcart")) {
            if(userid !== customId.split("_")[0]) return interaction.deferUpdate();
            await cart.delete(`${interaction.channel.id}`);
            interaction.channel.delete();
        }
        if(customId.endsWith("_termscart")) {
            if(userid !== customId.split("_")[0]) return interaction.deferUpdate();
            await interaction.reply({
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`${interaction.guild.name} | Nossos Termos`)
                    .setDescription(`${interaction.user} \n${await bot.get("termos")}`)
                ],
                ephemeral:true
            })
        }
        if(customId.endsWith("_addcart")) {
            if(userid !== customId.split("_")[0]) return interaction.deferUpdate();
            const carrinho = await cart.get(`${interaction.channel.id}`);
            const prod = await db.get(`${carrinho.produto}`);
            const quantia = Number(carrinho.quantia) + 1;
            if(quantia > prod.conta.length) return interaction.deferUpdate();
            await cart.add(`${interaction.channel.id}.quantia`, 1);
            update();
        }
        if(customId.endsWith("_removercart")) {
            if(userid !== customId.split("_")[0]) return interaction.deferUpdate();
            const carrinho = await cart.get(`${interaction.channel.id}`);
            const quantia = Number(carrinho.quantia) - 1;
            if(quantia < 1) return interaction.deferUpdate();
            await cart.substr(`${interaction.channel.id}.quantia`, 1);
            update();
        }


        async function aprovved(idcompra) {
            const carrinho = await cart.get(`${interaction.channel.id}`);
            const prod = await db.get(`${carrinho.produto}`);
            const user = interaction.client.users.cache.get(`${carrinho.user}`);
            const member = interaction.guild.members.cache.get(`${carrinho.user}`);
            const role = await interaction.guild.roles.cache.get(await bot.get("role"));
            interaction.channel.bulkDelete(10).then(async() => {
                interaction.channel.send({
                    content:`${emoji.user} | Usuario: ${user}\n${emoji.sim} | Compra Aprovada!\n${emoji.lupa} | ID do Carrinho: ${interaction.channel.id}`,
                    embeds:[
                        new EmbedBuilder()
                        .setDescription(`Olá ${user} Agradecemos a sua compra e esperamos que tenha um otimo dia! \n${emoji.aviso} | Verifique o Produto na Sua DM, este carrinho será fechado brevemente!`)
                    ],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId(`${carrinho.user}_cancelcart`)
                            .setEmoji(emoji.cart)
                            .setLabel("Fechar Carrinho")
                            .setStyle(2),
                        )
                    ]
                });
                if(user) {
                    if(role) {
                        if (!member.roles.cache.has(role.id)) {
                            member.roles.add(role.id).then(() => {console.log("Cargo Adicionado")}).catch(() => {console.log("Cargo Removido")});
                        }
                    }
                    if(prod.conta.length < carrinho.quantia) {
                        if(idcompra !== "semiauto") {
                            await interaction.channel.send({
                                content:`${user}`,
                                embeds:[
                                    new EmbedBuilder()
                                    .setTitle(`${interaction.guild.name} | Reembolso`)
                                    .setDescription(`${emoji.aviso} | Você Recebeu Reembolso porque alguem comprou primeiro!`)
                                ]
                            }).then(() => {
                                setTimeout(() => {
                                    interaction.channel.delete()
                                }, 5000);
                            })
                            const acesstoken = await bot.get("acesstoken");
                              try {
                                await axios.post(`https://api.mercadopago.com/v1/payments/${idcompra}/refunds`, {}, {
                                  headers: {
                                    Authorization: `Bearer ${acesstoken}`
                                  }
                                })
                                
    
                              } catch (error) {
                              }
                        } else {
                            
                            await interaction.channel.send({
                                content:`${user}`,
                                embeds:[
                                    new EmbedBuilder()
                                    .setTitle(`${interaction.guild.name} | Reembolso`)
                                    .setDescription(`${emoji.aviso} | Abra Ticket para receber reembolso, porque alguem comprou primeiro!`)
                                ]
                            }).then(() => {
                                setTimeout(() => {
                                    interaction.channel.delete()
                                }, 5000);
                            })
                        }
                          return;
                    } else {
                        const stock = prod.conta
                        const removed = stock.splice(0, Number(carrinho.quantia));
                        db.set(`${carrinho.produto}.conta`, stock);
                        user.send({
                                embeds: [
                                    new EmbedBuilder()
                                      .setTitle(`🎉 ${interaction.guild.name} | Compra aprovada 🎉`)
                                      .setDescription(`**${emoji.cart} | Produto(s) Comprado(s):**\n ${prod.nome} x${carrinho.quantia} \n\n **${emoji.raio} | Id da Compra:** \n ${interaction.channel.id} \n\n ${emoji.coracao} | Muito obrigado por comprar conosco, ${interaction.guild.name} agradece a sua preferência!`)
                                  ]
                        }).catch(() => {
                                interaction.channel.send({
                                    content:`${user} Seu PRIVADO ESTÁ BLOQUEADO!`,
                                    embeds: [
                                        new EmbedBuilder()
                                          .setTitle(`🎉 ${interaction.guild.name} | Compra aprovada 🎉`)
                                          .setDescription(`**${emoji.cart} | Produto(s) Comprado(s):**\n ${prod.nome} x${carrinho.quantia} \n\n **${emoji.raio} | Id da Compra:** \n ${interaction.channel.id} \n\n ${emoji.coracao} | Muito obrigado por comprar conosco, ${interaction.guild.name} agradece a sua preferência!`)
                                      ]
                                });
                        })
                        let msg1 = "";
                        removed.map((rs, index) => {
                          msg1 += `📦 | Entrega do Produto: ${prod.nome} - ${index + 1}/${carrinho.quantia} \n ${rs} \n\n`
                        });
                        if (carrinho.quantia > 5) {
                                fs.writeFileSync('detalhes_compra.txt', msg1);
                                user.send({
                                    files: ['detalhes_compra.txt'],
                                }).catch(() => {
                                    interaction.channel.send({
                                        files: ['detalhes_compra.txt'],
                                      })
                                })
                        } else {
                                  
                                user.send({ content: `${msg1}` }).catch(() => {
                                    interaction.channel.send({content:`${msg1}`})
                                })
                        }


                        const logs = interaction.guild.channels.cache.get(await bot.get("channel_logs"));
                        if(logs) {
                            if(carrinho.quantia < 5 ) {
                                
                            logs.send({
                                embeds:[
                                    new EmbedBuilder()
                                    .setTitle(`${interaction.guild.name} | Compra Aprovada`)
                                    .addFields(
                                        {
                                            name:`${emoji.nsei} | ID PEDIDO:`,
                                            value:`${interaction.channel.id}`
                                        },
                                        {
                                            name:`${emoji.user} | COMPRADOR:`,
                                            value:`${user} | ${user.username}`
                                        },
                                        {
                                            name:`${emoji.id} | ID COMPRADOR:`,
                                            value:`\`${user.id}\``
                                        },
                                        {
                                            name:`${emoji.calendario} | DATA:`,
                                            value:`<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)`
                                        },
                                        {
                                            name:`${emoji.prancheta} | PRODUTO ID:`,
                                            value:`${carrinho.produto}`
                                        },
                                        {
                                            name:`${emoji.cart} | PRODUTO NOME:`,
                                            value:`${prod.nome} x${carrinho.quantia}`
                                        },
                                        {
                                            name:`${emoji.dinheiro} | VALOR PAGO:`,
                                            value:`\`${Number(prod.preco).toFixed(2) * carrinho.quantia}\``
                                        },
                                        {
                                            name:`${emoji.mao} | MÉTODO DE PAGAMENTO:`,
                                            value:`\`PIX\``
                                        },
                                        {
                                            name:"✨ | PRODUTO ENTREGUE:",
                                            value:`\`\`\` ${removed.join("\n")} \`\`\``
                                        },
                                    )
                                ]
                            })
                            } else {
                                let msg1 = "";
                            removed.map((rs, index) => {
                              msg1 += `📦 | Entrega do Produto: ${prod.nome} - ${index + 1}/${carrinho.quantia} \n ${rs} \n\n`
                            });
                              fs.writeFileSync('detalhes_compra.txt', msg1);
                            logs.send({
                                embeds:[
                                    new EmbedBuilder()
                                    .setTitle(`${interaction.guild.name} | Compra Aprovada`)
                                    .addFields(
                                        {
                                            name:`${emoji.nsei} | ID PEDIDO:`,
                                            value:`${interaction.channel.id}`
                                        },
                                        {
                                            name:`${emoji.user} | COMPRADOR:`,
                                            value:`${user} | ${user.username}`
                                        },
                                        {
                                            name:`${emoji.id} | ID COMPRADOR:`,
                                            value:`\`${user.id}\``
                                        },
                                        {
                                            name:`${emoji.calendario} | DATA:`,
                                            value:`<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)`
                                        },
                                        {
                                            name:`${emoji.prancheta} | PRODUTO ID:`,
                                            value:`${carrinho.produto}`
                                        },
                                        {
                                            name:`${emoji.cart} | PRODUTO NOME:`,
                                            value:`${prod.nome} x${carrinho.quantia}`
                                        },
                                        {
                                            name:`${emoji.dinheiro} | VALOR PAGO:`,
                                            value:`\`${Number(prod.preco).toFixed(2) * carrinho.quantia}\``
                                        },
                                        {
                                            name:`${emoji.mao} | MÉTODO DE PAGAMENTO:`,
                                            value:`\`PIX\``
                                        },
                                        {
                                            name:"✨ | PRODUTO ENTREGUE:",
                                            value:`\`No .txt Abaixo!\``
                                        },
                                    )
                                ],
                                files: ['detalhes_compra.txt'],
                            })
                            }
                        }   
                    }
                
                }
            })
        }
        async function update() {
            const carrinho = await cart.get(`${interaction.channel.id}`);
            const prod = await db.get(`${carrinho.produto}`);
            await interaction.update({
                content:`${interaction.user}`,
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`${interaction.guild.name} | Sistema de Compra`)
                    .setDescription(`${emoji.ola} | Olá ${interaction.user}, Seja Bem-Vindo ao seu Carrinho de Compras!\n\n${emoji.aviso} | Lembre-se de Ver os Termos, ele é muito importante para uma melhor convivencia, entre você e a nossa equipe evitar futuros Problemas, Também Verifique se uma DM está Desbloqueada! \n\n${emoji.duvida} | Caso você queira ver as informações das compras elas estarão logos abaixos! \n\n${emoji.buzina} | Caso você clique em continuar você automaticamente aceita os nossos termos!\n\nㅤ`)
                    .setThumbnail(interaction.guild.iconURL())
                    .setFooter({text:"copyright - @whitebanido"})
                    .addFields(
                        {
                            name:`${emoji.planeta} | Produto:`,
                            value:`${prod.nome}`,
                            inline:true
                        },
                        {
                            name:`${emoji.dinheiro} | Valor:`,
                            value:`\`R$${Number(prod.preco).toFixed(2)}\``,
                            inline:true
                        },
                        {
                            name:`${emoji.caixa} | Estoque:`,
                            value:`\`${prod.conta.length}\``,
                            inline:true
                        },
                        {
                            name:`${emoji.lapis} | Quantidade:`,
                            value:`x\`${carrinho.quantia}\``,
                            inline:true
                        },
                        {
                            name:`${emoji.prancheta} | Descrição:`,
                            value:`${prod.description}`,
                            inline:true
                        },
                        {
                            name:`${emoji.dinheiro2} | total a Pagar:`,
                            value:`\`R$${Number(prod.preco).toFixed(2) * carrinho.quantia}\``,
                            inline:true
                        },
                    )
                ],
                components:[
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${interaction.user.id}_addcart`)
                        .setEmoji(emoji.mais)
                        .setStyle(2),
                        new ButtonBuilder()
                        .setCustomId(`${interaction.user.id}_removercart`)
                        .setEmoji(emoji.menos)
                        .setStyle(2),
                        new ButtonBuilder()
                        .setCustomId(`${interaction.user.id}_confirmcart`)
                        .setEmoji(emoji.sim)
                        .setLabel("Aceitar e Continuar")
                        .setStyle(3),
                        new ButtonBuilder()
                        .setCustomId(`${interaction.user.id}_termscart`)
                        .setEmoji(emoji.mao)
                        .setLabel("Nossos Termos")
                        .setStyle(1),
                        new ButtonBuilder()
                        .setCustomId(`${interaction.user.id}_cancelcart`)
                        .setEmoji(emoji.nao)
                        .setStyle(4),
                    )
                ]
            });
        }
}}