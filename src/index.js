require('dotenv').config();
const path = require('path');
const { Client, IntentsBitField, EmbedBuilder, AttachmentBuilder, MessageFlags} = require('discord.js');

const { dollSearch } = require('./dollSearch.js');
const { simpleError } = require('./simpleError.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
}) 

client.on('clientReady', (c) => {
    console.log(`Logged in as ${c.user.tag}!`)
});

client.on('error', (err) => {
     console.error(`Discord client Error:`, err);
});

client.on('messageCreate', (message) => {
    if(message.author.bot) {
        return;
    } else if (message.content === 'hello') {
        message.reply('hey!');
    }
});

client.on('interactionCreate', async (interaction) => {
    const role = process.env.ROLE_ID;
    const rawInput = interaction.options.getString('url');
    const ssPath = path.join(__dirname, 'screenshot', 'screenshot.png');
    
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'hey') {
        console.log(interaction);
        return interaction.reply('Hey~');
    }

    if (interaction.commandName === "doll_scraper") {
        await interaction.deferReply();

        try {
            const result = await dollSearch(rawInput);
            const ss = new AttachmentBuilder(ssPath);
            const embed = new EmbedBuilder()
                .setTitle("Doll Price: ")
                .setImage('attachment://screenshot.png')
                .addFields(
                    { name: '**UPDATE:**', value: `New Price change for ${rawInput}` },
                    { name: '**Price**',
                      value: result.price
                        ? `${result.price} ${result.currency ?? ''}`.trim()
                        : 'Price not found'
                });

            await interaction.editReply({ embeds: [embed], files: [ss] });
            await interaction.followUp({ content: `<@&${role}>`, allowedMentions: { roles: [role] } });
        } catch (err) {
            console.log(err);
            await interaction.editReply({
                content: `**Error at ${rawInput}:** ${simpleError(err)}`,
                allowedMentions: { roles: [role] }
            });
        };
    }

});

client.login(process.env.DISCORD_TOKEN);
