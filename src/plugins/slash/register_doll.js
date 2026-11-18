const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, PermissionFlagsBits} = require('discord.js');
const { simpleError } = require('../../handlers/simpleError.js');
const { checkDoll } = require('../../handlers/checkDoll.js');

module.exports = {
  type: 'slash',
  name: 'register_doll',
  data: new SlashCommandBuilder()
    .setName('register_doll')
    .setDescription('Scrapes a site for doll info')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('url')
        .setRequired(true)
    ),

  async execute(interaction) {

    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return await interaction.reply({
            //content: `${simpleError('adminErr')}`,
            content:'[PERMISSION DENIED] You must be an administrator to run this command',
            ephemeral: true,
        })
    }

    await interaction.deferReply();
    const role = process.env.ROLE_ID;
    const rawInput = interaction.options.getString('url');

    try {
      const { scrape: result, db } = await checkDoll(rawInput);

      const ss = new AttachmentBuilder(result.screenshot, { name: 'screenshot.png' });
      const embed = new EmbedBuilder()
        .setTitle(result.title ? `Doll Successfully Registered: ${result.title}` : 'Doll Price:')
        .setImage('attachment://screenshot.png')
        .addFields(
          { name: '**URL:**', value: `${rawInput}` },
          {
            name: '**Initial Price**',
            value: result.price
              ? `${result.price} ${result.currency ?? ''}`.trim()
              : 'Price not found'
          }
        );

      await interaction.editReply({ embeds: [embed], files: [ss] });

    } catch (err) {
      console.log(err);
      await interaction.editReply({
        content: `**Error at ${rawInput}:** ${simpleError(err)}`,
        allowedMentions: { roles: [role] }
      });
    }
  }
};
