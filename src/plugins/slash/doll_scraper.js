const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { simpleError } = require('../../handlers/simpleError.js');
const { checkDoll } = require('../../handlers/checkDoll.js');

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
      const { scrape: result, db } = await checkDoll(rawInput);
      const dbStatus = db ? db.label : 'Price not found (not saved)';

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
