const { Client, IntentsBitField, Collection, REST} = require('discord.js');
const config = require('./config');
const path = require('path');
const fs = require('fs');

const { simpleError } = require('./middleware/simpleError.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
}) 

client.commands = new Collection();

client.on('clientReady', async () => {
    try {
        console.log(`Logged in as ${client.user.tag}!`);
    } catch (error) {
        console.error(`Bot Initialization Failed: `, error)
        process.exit(1);
    }
}); 

client.on('error', (err) => {
     console.error(`Discord client Error:`, err);
});

const commandsPath = path.join(__dirname, 'commands');
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')); 

for (const file of commandsFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`WARNING The command at ${filePath} is missing a required "data" or "execute" property`);
    }
}

client.on('interactionCreate', async (interaction) => {
    if(!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const errorPayload = { content: 'There was an error while executing this command', ephemeral: true };
        if (interaction.deffered || interaction.replied) {
            await interaction.editReply(errorPayload);
        } else {
            await interaction.reply(errorPayload);
        }
    }

});

module.exports = client;
