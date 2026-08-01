const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { dollSearch } = require('../middleware/dollsearch.js');
const { simpleError } = require('../middleware/simpleError.js');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("doll_scraper")
    .setDescription('Scrapes a site for doll info')
    .addStringOption( option => 
            option.setName('url')
            .setDescription('url')
            .setRequired(true)
    ),

    async execute(interaction) {
        await interaction.deferReply();
        const role = process.env.ROLE_ID;
        const rawInput = interaction.options.getString('url');

        try {
            const result = await dollSearch(rawInput);
            const ss = new AttachmentBuilder(result.screenshot, { name: 'screenshot.png' });
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
}
