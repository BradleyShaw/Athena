/* eslint-disable require-jsdoc */
async function ping(bot, event, irc, args) {
    await irc.reply(event, 'Pong');
}

module.exports = {
    ping
};
