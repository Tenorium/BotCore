import args from 'splitargs'
import { Message, MessageMentions } from 'discord.js'
import { dirname, join } from 'path'
import i18n_ from 'i18n'
import { EventEmitterWrapper, classLogger, EventsList } from 'utilslib'

const { I18n } = i18n_
const configManager = app('ConfigManager')

const i18n = new I18n({
  locales: ['en', 'ru'],
  directory: join(dirname(new URL('', import.meta.url).pathname), './CommandManager/locale')
})

i18n.setLocale(configManager.readConfig('core')?.getField('locale') ?? 'en')

let constructed: boolean = false
const commands: Record<string, CommandHandlerFunc> = {}
const disabledCommands: string[] = []

class CommandManager extends EventEmitterWrapper<CommandManagerEvents> {
  _className = 'CommandManager'

  constructor () {
    if (constructed) {
      throw new Error('Use app(\'CommandManager\') instead')
    }

    super()

    app('Core').registerClientEvent('messageCreate', function (message: Message) {
      const prefix = app('Core').getConfig()?.getPrefix()
      if (prefix === undefined ||
        !(message.content.startsWith(prefix) ||
              MessageMentions.USERS_PATTERN.test(message.content))
      ) {
        return
      }

      let prefix_: string | undefined

      if (message.content.startsWith(prefix)) {
        prefix_ = prefix
      }

      if (prefix_ === undefined) {
        const match = message.content.match(MessageMentions.USERS_PATTERN)

        if (match === null) {
          return
        }

        prefix_ = match[0]
      }

      const messageWithoutPrefix = message.content.replace(prefix_, '')

      const command = Object.keys(commands).filter(value => messageWithoutPrefix.startsWith(value))[0] ?? null

      if (command === null) {
        return
      }

      if (disabledCommands.includes(command)) {
        disabledCommandHandler(command, message)
        return
      }

      try {
        commands[command](args(message.content.replace(`${prefix_ + command} `, '')), message)
      } catch (e) {
        // @ts-expect-error
        errorCommandHandler(command, message, e)
      }
    })

    constructed = true
  }

  /**
     * Register command (chat command, not slash command)
     * @param {!string} commandName
     * @param {CommandHandlerFunc} handler
     * @fires CommandManager#commandRegistered
     * @throws Error
     */
  registerCommand (commandName: string, handler: CommandHandlerFunc): void {
    if (!Object.hasOwn(commands, commandName)) {
      commands[commandName] = handler

      /**
       * Registered command
       *
       * @event CommandManager#commandRegistered
       * @type {string}
       */
      this.emit('commandRegistered', commandName)
      return
    }

    throw new Error('Command already registered!')
  }

  /**
     * Unregister command
     * @param {!string} commandName
     * @fires CommandManager#commandUnregistered
     * @throws Error
     */
  unregisterCommand (commandName: string): void {
    if (this.hasCommand(commandName)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete commands[commandName]

      this.emit('commandUnregistered', commandName)
      return
    }

    throw new Error('Command not exist!')
  }

  listCommands (): string[] {
    return Object.keys(commands).map(key => key)
  }

  hasCommand (commandName: string): boolean {
    return Object.hasOwn(commands, commandName)
  }

  /**
     * Check if command disabled
     * @param {!string} commandName
     * @return {boolean}
     * @throws Error
     */
  isDisabled (commandName: string): boolean {
    if (!this.hasCommand(commandName)) {
      throw new Error('Command not exist!')
    }

    return disabledCommands.includes(commandName)
  }

  /**
     * Disable command
     * @fires CommandManager#commandDisabled
     * @param commandName
     * @throws Error
     */
  disableCommand (commandName: string): void {
    if (!this.isDisabled(commandName)) {
      disabledCommands.push(commandName)
    }

    /**
     * Disabled command event
     * @event CommandManager#commandDisabled
     * @type {string}
     */
    this.emit('commandDisabled', commandName)
  }

  /**
     * Enable command
     * @fires CommandManager#commandEnabled
     * @param commandName
     * @throws Error
     */
  enableCommand (commandName: string): void {
    if (this.isDisabled(commandName)) {
      const index = disabledCommands.indexOf(commandName)
      if (index !== -1) {
        disabledCommands.splice(index, 1)
      }
    }

    /**
     * Command enabled event
     * @event CommandManager#commandEnabled
     * @type {string}
     */
    this.emit('commandEnabled', commandName)
  }

  static _warning: ((message: string) => void)
  static _error: (message: string, e: Error | null) => void
  static _fatal: (message: string, e: Error | null) => void
  static _debug: (message: string) => void
  static _info: (message: string) => void
}

classLogger(CommandManager)

export default CommandManager

const disabledCommandHandler = function (command: string, message: Message): void {
  const core = app('Core')

  const client = core.getClient()

  void message.reply({
    embeds: [
      {
        author: {
          name: client.user?.username ?? undefined,
          iconURL: client.user?.avatarURL() ?? undefined
        },
        color: 'GOLD',
        title: i18n.__('disabled_title'),
        description: i18n.__('disabled_description', { command })
      }
    ]
  })
}

const errorCommandHandler = function (command: string, message: Message, e: Error): void {
  const core = app('Core')

  const client = core.getClient()

  void message.reply({
    embeds: [
      {
        author: {
          name: client.user?.username ?? undefined,
          iconURL: client.user?.avatarURL() ?? undefined
        },
        color: 'RED',
        title: i18n.__('error_title'),
        description: i18n.__('error_description', { command })
      }
    ]
  })

  CommandManager._error('Unhandled error from command.\n', e)
}

/**
 * @event CommandsEventEmitter#commandRegistered
 * @type {string}
 */

/**
 * @event CommandsEventEmitter#commandUnregistered
 * @type {string}
 */

/**
 * @event CommandsEventEmitter#commandDisabled
 * @type {string}
 */

/**
 * @event CommandsEventEmitter#commandEnabled
 * @type {string}
 */

// DECLARATIONS
export type CommandHandlerFunc = (args: string[], message: Message) => void
export interface CommandManagerEvents extends EventsList {
  commandRegistered: (commandName: string) => void
  commandUnregistered: (commandName: string) => void
  commandDisabled: (commandName: string) => void
  commandEnabled: (commandName: string) => void
}
