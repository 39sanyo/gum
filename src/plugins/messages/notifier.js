const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

async function notifyPriceChange(client, dbResult, screenshot) {
  if (!dbResult || dbResult.status !== 'UPDATED') return;

  const { name, url, oldPrice, newPrice } = dbResult.doll;
  const dropped = newPrice < oldPrice;

  const embed = new EmbedBuilder()
    .setTitle(`${dropped ? '📉 Price drop' : '📈 Price increase'}: ${name}`)
    .setURL(url)
    .setDescription(` ID:~~$${oldPrice}~~ → **$${newPrice}**`)
    .setColor(dropped ? 0x2ecc71 : 0xe74c3c)
    .setTimestamp();

  const files = [];
  if (screenshot) {
    files.push(new AttachmentBuilder(screenshot, { name: 'screenshot.png' }));
    embed.setImage('attachment://screenshot.png');
  }

  const role = process.env.ROLE_ID;
  const channel = await client.channels.fetch(process.env.NOTIFY_CHANNEL_ID);
  await channel.send({
    content: role ? `<@&${role}>` : undefined,
    allowedMentions: role ? { roles: [role] } : undefined,
    embeds: [embed],
    files,
  });
}

module.exports = { notifyPriceChange };
