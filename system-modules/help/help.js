import { MessageEmbed } from 'discord.js';
import AbstractModule from '#abstractModule';
import CommandManager from '#commandManager';
import { dirname, join } from 'path';
import i18n_ from 'i18n';

const { I18n } = i18n_;

const i18n = new I18n({
  locales: ['en', 'ru'],
  directory: join(dirname(new URL('', import.meta.url).pathname), 'locale')
});

i18n.setLocale(app().getConfig().locale);

const helps = [];

const MAX_PAGE_SIZE = 2;

/**
 *
 * @param page
 * @return {MessageEmbed}
 * @private
 */
const buildEmbed = (page) => {
  const sortedHelps = helps.sort((a, b) => (a ?? 0).toString().localeCompare((b ?? 0).toString()));
  const pagedHelps = sortedHelps.slice((MAX_PAGE_SIZE - 1) * (page - 1), ((MAX_PAGE_SIZE - 1) * page) + 1);

  let description = '';
  pagedHelps.forEach((value) => {
    description +=
            `**${value.name}**\n
            ${i18n.__('usage')} *${value.usage}*\n
            ${value.description}\n\n`
  });

  const embed = new MessageEmbed();
  embed.setColor('YELLOW');
  embed.setDescription(description);
  return embed;
}

// const maxPages = () => {
//     helps
// }

export default class HelpModule extends AbstractModule {
  /**
     *
     * @param {string} command
     * @param {string} description
     * @param {string} usage
     */
  static addCommandHelp (command, description, usage) {
    helps.push(
      {
        name: command,
        description,
        usage
      });
  }

  /**
     *
     * @param {string} command
     */
  static removeCommandHelp (command) {
    for (const helpRecord in helps) {
      if (helpRecord.name === command) {
        const index = helps.indexOf(helpRecord);
        helps.splice(index, 1);
        break;
      }
    }
  }

  load () {
    CommandManager.registerCommand('help', async (args, message) => {
      const embed = buildEmbed(1);

      /**
             *
             * @param {import('discord.js').MessageReaction} reaction
             * @param {import('discord.js').User} user
             */
      const filter = (reaction, user) => !user.bot && ['❌', '⬅', '➡'].includes(reaction.emoji.name);

      message.channel.send({
        embeds: [
          embed
        ]
      }).then((newMessage) => {
        let page = 1;

        (async () => {
          await newMessage.react('⬅');
          await newMessage.react('❌');
          await newMessage.react('➡');
        })();

        const collector = newMessage.createReactionCollector({ filter });

        collector.on('collect', function (reaction, user) {
          reaction.users.remove(user);
          if (reaction.emoji.name === '⬅') {
            if (page <= 1) {
              return;
            }
            page--;
          }

          if (reaction.emoji.name === '➡') {
            if (page >= (helps.length / MAX_PAGE_SIZE)) {
              return;
            }
            page++;
          }

          if (reaction.emoji.name === '❌') {
            collector.stop();
            return;
          }

          newMessage.edit(
            {
              embeds: [
                buildEmbed(page)
              ]
            }
          );
        });

        collector.on('end', () => {
          newMessage.delete();
        });
      });
    });

    HelpModule.addCommandHelp('help', 'Show this message', 'help');
  }

  unload () {
  }
}
