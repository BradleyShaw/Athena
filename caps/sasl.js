/** Class to handle all SASL authentification processes */
class Sasl {

    /**
    * @func
    * @param {string} username
    * @param {string} password
    * @param {string} [method]
    */
    constructor(username, password, method) {
        this.username = username;
        this.password = password;
        this.method = method || 'plain';
        this.retries = 0;
        this.name = 'sasl';
    }

    /**
    * @func
    * @param {object} bot
    * @param {array} [args]
    */
    async run(bot, args) {
        const mechanisms = args || ['EXTERNAL', 'PLAIN'];

        this.bot = bot;

        if (mechanisms.indexOf(this.method.toUpperCase()) > -1) {
            if (['plain', 'external'].indexOf(this.method) > -1) {
                await bot.send(`AUTHENTICATE ${this.method.toUpperCase()}`);
            } else {
                throw new Error('Not implemented yet');
            }
        } else {
            throw new Error('Not supported by server');
        }
    }

    /**
    * @func
    * @param {object} event
    */
    async on_authenticate(event) {
        let password;

        if (event.arguments[0] === '+') {
            if (this.method === 'plain') {
                password = Buffer.from(`${this.username}\x00${this.username}\x00${this.password}`).toString('base64');
            } else if (this.method === 'external') {
                password = '+';
            }

            await this.bot.send(`AUTHENTICATE ${password}`);
        }
    }

    /**
    * @func
    * @param {object} event
    */
    async on_saslfailed(event) {
        this.retries += 1;

        if (this.method === 'external') {
            if (this.retries === 2) {
                this.retries = 1;
                this.method = 'plain';

                await this.bot.send('AUTHENTICATE PLAIN');
            } else {
                await this.bot.send('AUTHENTICATE EXTERNAL');
            }
        } else if (this.method === 'plain') {
            if (this.retries !== 2) {
                await this.bot.send('AUTHENTICATE PLAIN');
            } else {
                await this.bot.send('AUTHENTICATE *');
                throw new Error('SASL authentication failed!');
            }
        }
    }

    /**
    * @func
    * @param {object} event
    */
    async on_saslsuccess(event) {
        await this.bot.send('CAP END');
    }

}

Sasl.name = 'sasl';
module.exports = Sasl;
