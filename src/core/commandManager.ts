import args from 'splitargs'
import { Message, MessageMentions } from 'discord.js'
import { EventEmitterWrapper, classLogger, EventsList } from '@tenorium/utilslib'
import LocaleManager from '../util/localeManager.js'

const i18n = LocaleManager.getI18n('commandManager')
let locale: string | undefined

let constructed: boolean = false
const commands: Record<string, CommandHandlerFunc> = {}
const disabledCommands: string[] = []

class CommandManager extends EventEmitterWrapper<CommandManagerEvents> {
  _className = 'CommandManager'

  constructor () {
    if (constructed) {
      throw new ConstructorUsedError()
    }

    super()

    locale = app('Core').getConfig()?.getLocale()

    if (locale !== undefined) {
      i18n.setLocale(locale)
    }

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
     * @throws {CommandAlreadyRegisteredError}
     */
  registerCommand (commandName: string, handler: CommandHandlerFunc): void {
    if (Object.hasOwn(commands, commandName)) {
      throw new CommandAlreadyRegisteredError()
    }

    commands[commandName] = handler

    /**
       * Registered command
       *
       * @event CommandManager#commandRegistered
       * @type {string}
       */
    this.emit('commandRegistered', commandName)
  }

  /**
     * Unregister command
     * @param {!string} commandName
     * @fires CommandManager#commandUnregistered
     * @throws {CommandNotExistsError}
     */
  unregisterCommand (commandName: string): void {
    if (!this.hasCommand(commandName)) {
      throw new CommandNotExistsError()
    }

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete commands[commandName]

    this.emit('commandUnregistered', commandName)
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
     * @throws {CommandNotExistsError}
     */
  isDisabled (commandName: string): boolean {
    if (!this.hasCommand(commandName)) {
      throw new CommandNotExistsError()
    }

    return disabledCommands.includes(commandName)
  }

  /**
     * Disable command
     * @fires CommandManager#commandDisabled
     * @param commandName
     * @throws {CommandNotExistsError}
     * @throws {CommandAlreadyDisabledError}
     */
  disableCommand (commandName: string): void {
    if (this.isDisabled(commandName)) {
      throw new CommandAlreadyDisabledError()
    }

    disabledCommands.push(commandName)

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
     * @throws {CommandNotExistsError}
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

// ERRORS

export class ConstructorUsedError extends Error {
  constructor () {
    super('Use app(\'CommandManager\') instead')
  }
}

export class CommandAlreadyRegisteredError extends Error {
  constructor () {
    super('Command already registered!')
  }
}

export class CommandNotExistsError extends Error {
  constructor () {
    super('Command not exists!')
  }
}

export class CommandAlreadyDisabledError extends Error {
  constructor () {
    super('Command already disabled!')
  }
}

// DECLARATIONS

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

export type CommandHandlerFunc = (args: string[], message: Message) => void
export interface CommandManagerEvents extends EventsList {
  commandRegistered: (commandName: string) => void
  commandUnregistered: (commandName: string) => void
  commandDisabled: (commandName: string) => void
  commandEnabled: (commandName: string) => void
}
