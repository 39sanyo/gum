const { EmbedBuilder } = require('discord.js');

async function notifyPriceChange(client, result) {
  if (result.status !== 'UPDATED') return;

  const { name, url, oldPrice, newPrice } = result.doll;
  const dropped = newPrice < oldPrice;

  const embed = new EmbedBuilder()
    .setTitle(`${dropped ? 'Price drop' : 'Price increase'}: ${name}`)
    .setURL(url)
    .setDescription(`~~$${oldPrice}~~ → **$${newPrice}**`)
    .setColor(dropped ? 0x2ecc71 : 0xe74c3c)
    .setTimestamp();

  const channel = await client.channels.fetch(process.env.NOTIFY_CHANNEL_ID);
  await channel.send({ embeds: [embed] });
}

module.exports = { notifyPriceChange };
