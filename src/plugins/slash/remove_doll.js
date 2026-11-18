const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { EPHEMERAL } = require('../../core/constants');
const { removeDoll } = require('../../handlers/dollMaster')

module.exports = {
    type: 'slash',
    name: 'remove_doll',
    data: new SlashCommandBuilder()
        .setName('remove_doll')
        .setDescription("Remove a doll from the database using its ID (Admin Only)")
        .addIntegerOption(option =>
            option
                .setName('doll_id')
                .setDescription('The ID of the doll to remove')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({
                content: '[PERMISSION DENIED] You must be an Admin to run this command,',
                ephemeral: true,
            });
        } 

        const rawInput = interaction.options.getInteger('doll_id');

        try {
            const result = removeDoll(rawInput);

            if (result.status === 'NOT_FOUND') {
                return interaction.reply({ content: result.label, ephemeral: true });
            }

            return interaction.reply({ content: result.label })
        } catch (error) {
            console.error('remove_doll failed:', error);
            return interaction.reply({
                content: '[ERROR] unable to remove doll :('
            })
        }
    }
};
