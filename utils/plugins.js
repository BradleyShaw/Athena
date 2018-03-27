const log = require('./logging');
const { check_perms } = require('./permissions';)
const { readdir } = require('fs');
const { join } = require('path');

/**
* Class that holds methods for calling and adding commands
* @class
*/
class Plugins {
    /**
    * @param {object} bot - The `this` object from the upstream class.
    */
    constructor(bot) {
        this.bot = bot;
        readdir('./plugins', (err, files) => {
            for (let file of files) {
                const plugin = require('../' + join('plugins', file));

                for (let cmd of Object.keys(plugin)) {
                    this.add_cmd(cmd, plugin[cmd]);
                }
            }
        });
    }

    /**
    * Adds a comand to the class
    * @func
    * @param {string} name
    * @param {function} func
    */
    add_cmd(name, func) {
        this[name] = func;
    }

    /**
    * Calls a command previously added to the class
    * @param {Parser} event
    * @param {ConnectionWrapper} irc
    * @param {array} args
    */
    call_command(event, irc, args) {
        if (this[args[0]] !== undefined) {
            try {
                let cmd = this[args[0]];

                if (check_perms(this.bot.config, event.source.host, event.target, cmd.opts.perms)) {
                    cmd(this.bot, event, irc, args.slice(1));
                } else {
                    irc.reply(event, `No permission to use command ${args[0]}`)
                }
            } catch (e) {
                log.error(e.stack);
            }
        } else {
            irc.reply(event, `Invalid Command: ${args[0]}`);
        }
    }
}

module.exports = Plugins;
