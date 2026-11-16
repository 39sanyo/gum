const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { dollSearch } = require('../../handlers/dollScraper/dollSearch');
const { simpleError } = require('../../handlers/simpleError.js');
const { insertDollMaster } = require('../../handlers/dollMaster.js');

module.exports = {
  type: 'slash',
  name: 'doll_scraper',
  data: new SlashCommandBuilder()
    .setName('doll_scraper')
    .setDescription('Scrapes a site for doll info')
    .addStringOption(option =>
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

      // 1. Clean the scraped price into a number (e.g. "$14,246 TWD" -> 14246)
      const numericPrice = result.price 
        ? parseFloat(String(result.price).replace(/[^0-9.]/g, '')) 
        : null;

      // 2. Save to SQLite using insertDollMaster and result.title
      let dbStatus = 'Price not found (not saved)';
      if (numericPrice !== null && !isNaN(numericPrice)) {
        const dbResult = insertDollMaster({
          name: result.title || 'Unknown Doll',
          listing_url: rawInput,
          price: numericPrice
        });
        dbStatus = dbResult.label;
      }

      const ss = new AttachmentBuilder(result.screenshot, { name: 'screenshot.png' });
      const embed = new EmbedBuilder()
        .setTitle(result.title ? `Doll Price: ${result.title}` : 'Doll Price:')
        .setImage('attachment://screenshot.png')
        .addFields(
          { name: '**UPDATE:**', value: `${dbStatus} for ${rawInput}` },
          {
            name: '**Price**',
            value: result.price
              ? `${result.price} ${result.currency ?? ''}`.trim()
              : 'Price not found'
          }
        );

      await interaction.editReply({ embeds: [embed], files: [ss] });
      await interaction.followUp({ content: `<@&${role}>`, allowedMentions: { roles: [role] } });

    } catch (err) {
      console.log(err);
      await interaction.editReply({
        content: `**Error at ${rawInput}:** ${simpleError(err)}`,
        allowedMentions: { roles: [role] }
      });
    }
  }
};
