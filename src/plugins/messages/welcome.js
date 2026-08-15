module.exports = {
    type: 'message',
    name: 'welcome',
    description: 'welcomes new members',

    filter(message) {
        return message.type===7; //GUILD_MEMEBER_JOIN
    },

    async execute(message) {
        await message.channel.send(`Welcome ${message.author}`);
    }
};
