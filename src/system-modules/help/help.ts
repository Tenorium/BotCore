import { type Message, MessageEmbed, type MessageReaction, type User } from 'discord.js'
import AbstractModule from '../../core/module-system/abstractModule.js'
import LocaleManager from '../../util/localeManager.js'
const i18n = LocaleManager.getI18n('help')

const locale = app('Core').getConfig()?.getLocale()

if (locale !== undefined) {
  i18n.setLocale(locale)
}

// eslint-disable-next-line no-undef
const CommandManager = app('CommandManager')

const helps: Array<{
  name: string
  description: string
  usage: string
}> = []

const MAX_PAGE_SIZE = 2

/**
 *
 * @param page
 * @return {MessageEmbed}
 * @private
 */
const buildEmbed = (page: number): MessageEmbed => {
  const sortedHelps = helps.sort((a, b) => a.name.toString().localeCompare(b.name.toString()))
  const pagedHelps = sortedHelps.slice((MAX_PAGE_SIZE - 1) * (page - 1), ((MAX_PAGE_SIZE - 1) * page) + 1)

  let description = ''
  pagedHelps.forEach((value) => {
    description +=
            `**${value.name}**\n
            ${i18n.__('usage')} *${value.usage}*\n
            ${value.description}\n\n`
  })

  const embed = new MessageEmbed()
  embed.setColor('YELLOW')
  embed.setDescription(description)
  return embed
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
  static addCommandHelp (command: string, description: string, usage: string): void {
    helps.push(
      {
        name: command,
        description,
        usage
      })
  }

  /**
     *
     * @param {string} command
     */
  static removeCommandHelp (command: string): void {
    for (const helpRecord of helps) {
      if (helpRecord.name === command) {
        const index = helps.indexOf(helpRecord)
        helps.splice(index, 1)
        break
      }
    }
  }

  load (): void {
    CommandManager.registerCommand('help', (args: string[], message: Message): void => {
      const embed = buildEmbed(1)

      /**
             *
             * @param {import('discord.js').MessageReaction} reaction
             * @param {import('discord.js').User} user
             */
      const filter = (reaction: MessageReaction, user: User): boolean => !user.bot && reaction.emoji.name !== null && ['❌', '⬅', '➡'].includes(reaction.emoji.name)

      void message.channel.send({
        embeds: [
          embed
        ]
      }).then((newMessage) => {
        let page = 1

        void (async () => {
          await newMessage.react('⬅')
          await newMessage.react('❌')
          await newMessage.react('➡')
        })()

        const collector = newMessage.createReactionCollector({ filter })

        collector.on('collect', function (reaction, user) {
          void reaction.users.remove(user)
          if (reaction.emoji.name === '⬅') {
            if (page <= 1) {
              return
            }
            page--
          }

          if (reaction.emoji.name === '➡') {
            if (page >= (helps.length / MAX_PAGE_SIZE)) {
              return
            }
            page++
          }

          if (reaction.emoji.name === '❌') {
            collector.stop()
            return
          }

          void newMessage.edit(
            {
              embeds: [
                buildEmbed(page)
              ]
            }
          )
        })

        collector.on('end', () => {
          void newMessage.delete()
        })
      })
    })

    HelpModule.addCommandHelp('help', 'Show this message', 'help')
  }

  unload (): void {
  }
}

// DECLARATIONS

declare global {
  interface AppModules {
    help: HelpModule
  }
}
