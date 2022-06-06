import { Intents } from "discord.js";

/**
 *
 * @type {{prefix: string, logger: {debug: boolean, dateformat: string}, client: {intents: number[]}, token: string}}
 */
export default {
    logger: {
        debug: true,
        dateformat: "DD.MM.YYYY HH:mm:ss"
    },
    // ClientOptions
    client: {
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS
        ]
    },
    locale: 'ru',
    token: 'sz52gBAeLAKBYDPvQepP4GUd.u3WUu4.OgQK1F2eyo_19jEVEbK8JudFXc4',
    prefix: '//'
};