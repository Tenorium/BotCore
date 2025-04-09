import { Logger } from '@tenorium/utilslib'
import wtfnode from 'wtfnode'
import ConfigManager from '../util/configManager.js'
import LoggerConfigMapper from '../util/datamappers/loggerConfigMapper.js'
export default class Core {
  static #initialized: boolean = false

  constructor () {
    if (app('ServiceLocator').has('Core')) {
      throw new ConstructorUsedError()
    }

    const logsConfig = ConfigManager.readConfig('logs')

    if (logsConfig != null) {
      Logger.setConfig(LoggerConfigMapper.fromDataObject(logsConfig))
    }
  }

  /**
     * Core initialization function
     */
  init (): void {
    if (Core.#initialized) {
      throw new CoreAlreadyInitializedError()
    }

    const ModuleManager = app('ModuleManager')

    Logger.info('Core init started!')

    void ModuleManager.autoload().then(() => {
    }).catch(
      (reason: Error | null | undefined) => {
        Logger.error('Unexpected error in ModuleManager at autoload', reason)
      }
    )

    Core.#initialized = true
  }

  /**
     * Unload all modules and exit
     */
  shutdown (): void {
    const ModuleManager = app('ModuleManager')

    wtfnode.init()

    try {
      ModuleManager.unloadAll()
    } catch (e) {
      if (e instanceof Error) {
        Logger.error('Error in ModuleManager at unloadAll', e)
      }

      Logger.error('Error in ModuleManager at unloadAll')
    }
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
// DECLARATIONS

// declare global {
//   interface AppServices {
//   }
// }
