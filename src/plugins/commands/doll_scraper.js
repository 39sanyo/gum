const { DISCORD_PERMISSIONS } = require('../../core/constants');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { dollSearch } = require('../helpers/dollsearch.js');
const { simpleError } = require('../helpers/simpleError.js');

module.exports = {
    type: 'command',
    name: 'doll_scraper',
    description: 'Scrapes a site for doll price',
    permission: null,

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
