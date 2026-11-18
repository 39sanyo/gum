const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { EPHEMERAL } = require('../../core/constants');

module.exports = {
    type: 'slash',
    name: 'admin_command',
    data: new SlashCommandBuilder()
        .setName('admin_command')
        .setDescription('Admin Only Command.'),
    
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({
                content: '[PERMISSION DENIED] You must be and Admin to run this command',
                ephemeral: true
            });
        }
        
        await interaction.reply({
            content: 'Hello Admin',
            flags: EPHEMERAL
        });
    }
};
