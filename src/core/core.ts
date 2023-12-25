import { Awaitable, Client, ClientEvents, ClientOptions } from 'discord.js'
import { v4 as uuidv4 } from 'uuid'
import { Logger } from '@tenorium/utilslib'
import wtfnode from 'wtfnode'
import { CoreConfig } from '../init.d/init.config.js'
import CommandManager from './commandManager.js'

declare type EventHandlerInternalType = (...args: any) => Awaitable<void>

export default class Core {
  #events: Record<string, { name: string, handler: EventHandlerInternalType }> = {}
  readonly #config: CoreConfig | undefined

  #client: import('discord.js').Client | undefined
  static #initialized: boolean = false

  constructor (config: CoreConfig) {
    if (app('ServiceLocator').has('Core')) {
      throw new ConstructorUsedError()
    }

    this.#config = config
    Logger.setConfig(this.#config?.getLoggerConfig())
  }

  /**
     * Core initialization function
     */
  init (): void {
    if (Core.#initialized) {
      throw new CoreAlreadyInitializedError()
    }

    const ServiceLocator = app('ServiceLocator')
    const ModuleManager = app('ModuleManager')

    Logger.info('Core init started!')

    try {
      this.#client = new Client(this.#config?.getClientConfig().getData() as ClientOptions)
    } catch (e) {
      // @ts-expect-error
      Logger.error('Unexpected error in Client', e)
    }

    if (this.#client !== undefined && this.#config !== undefined) {
      void this.#client.login(this.#config.getToken()).catch(
        (reason: Error | null | undefined) => {
          Logger.error('Unexpected error in Client', reason)
        })
    }

    ServiceLocator.register('CommandManager', new CommandManager())

    void ModuleManager.autoload().then(() => {
      if (this.#client === undefined) {
        Logger.fatal('Client is undefined')
        throw new Error('Client is undefined')
      }

      if (this.#config === undefined) {
        Logger.fatal('Config is undefined')
        throw new Error('Config is undefined')
      }
    }).catch(
      (reason: Error | null | undefined) => {
        Logger.error('Unexpected error in ModuleManager at autoload', reason)
      }
    )

    Core.#initialized = true
  }

  /**
     * Config getter
     * @returns {*}
     */
  getConfig (): CoreConfig | undefined {
    return this.#config
  }

  getClient (): Client {
    if (this.#client === undefined) {
      Logger.fatal('Client is undefined')
      throw new Error('Client is undefined')
    }

    return this.#client
  }

  /**
     * Destroy Discord client, unload all modules and exit
     */
  shutdown (): void {
    if (this.#client === undefined) {
      Logger.fatal('Client is undefined')
      throw new Error('Client is undefined')
    }

    const ModuleManager = app('ModuleManager')

    this.#client.destroy()

    wtfnode.init()

    try {
      ModuleManager.unloadAll()
    } catch (e) {
      // @ts-expect-error
      Logger.error('Error in ModuleManager at unloadAll', e)
    }
  }

  /**
     * Register Discord Client event
     * @param {string} name
     * @param {function} handler
     * @param {boolean} once
     * @returns {*|string}
     */
  registerClientEvent<T extends keyof ClientEvents = keyof ClientEvents> (name: T, handler: (...args: ClientEvents[T]) => Awaitable<void>, once = false): string {
    if (this.#client === undefined) {
      Logger.fatal('Client is undefined')
      throw new Error('Client is undefined')
    }

    const uuid = uuidv4()

    const wrapper: EventHandlerInternalType = function (...args: any[]): Awaitable<void> {
      try {
        return handler(...args as ClientEvents[T])
      } catch (e) {
        // @ts-expect-error
        Logger.error('Error in client event', e)
      }
    }

    this.#events[uuid] = {
      name,
      handler: wrapper
    }

    if (once) {
      this.#client.once(name, wrapper)
    } else {
      this.#client.on(name, wrapper)
    }

    return uuid
  }

  /**
     * Unsubscribe Discord Client event
     * @param {string} uuid
     */
  unregisterClientEvent (uuid: string): void {
    const event = this.#events[uuid] ?? null
    if (event === null) {
      throw new EventNotFountError()
    }

    if (this.#client === undefined) {
      Logger.fatal('Client is undefined')
      throw new Error('Client is undefined')
    }

    this.#client.off(event.name, event.handler)
  }
}

// ERRORS

export class ConstructorUsedError extends Error {
  constructor () {
    super('Use app(\'Core\') instead')
  }
}

export class CoreAlreadyInitializedError extends Error {
  constructor () {
    super('Core already initialized!')
  }
}

export class EventNotFountError extends Error {
  constructor () {
    super('Event not found')
  }
}

// DECLARATIONS

declare global {
  interface AppServices {
    CommandManager: CommandManager
  }
}
