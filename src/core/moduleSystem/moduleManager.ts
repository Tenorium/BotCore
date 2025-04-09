import { join } from 'path'
import { existsSync } from 'fs'
import type AbstractModule from './abstractModule.js'
import { classLogger, DataObject, EventEmitterWrapper, type EventsList, getDirectories } from '@tenorium/utilslib'
import ModuleLoader, { USER_MODULES_DIR } from './moduleLoader.js'
import CliModule from '../../system-modules/cli/cli.js'
import { ModuleManagerConfigMapper } from '../../util/datamappers/moduleManagerConfigMapper.js'

const SYSTEM_MODULES: Record<string, typeof AbstractModule> = {
  cli: CliModule
}

let constructed = false

class ModuleManager extends EventEmitterWrapper<ModuleManagerEvents> {
  #modules: Record<keyof AppModules | string, AppModules[keyof AppModules] | AbstractModule> = {}
  static _className = 'ModuleManager'

  constructor (options?: EventEmitterOptions) {
    if (constructed) {
      throw new Error('Use app(\'ModuleManager\') instead')
    }

    constructed = true

    super(options)
  }

  async autoload (): Promise<void> {
    const modules = this.listModules()

    const config = this.#getConfig()
    const disabledModules = config.getDisabledModules()

    for (const module_ of modules) {
      if (disabledModules.includes(module_)) {
        ModuleManager._debug(`Module ${module_} is disabled, skipping.`)
        continue
      }

      if (Object.hasOwn(SYSTEM_MODULES, module_)) {
        ModuleManager._debug(`Loading system module ${module_}`)
        ModuleLoader.loadSystemModule(module_, moduleInstance => {
          this.#modules[module_] = moduleInstance
          this.emit('moduleLoaded', module_)
        })
        continue
      }

      ModuleManager._debug(`Loading module ${module_}`)
      await this.load(module_)
    }

    this.emit('autoLoadFinished')
  }

  async load (name: string): Promise<void> {
    if (Object.keys(this.#modules).includes(name)) {
      return
    }

    await ModuleLoader.load(name, moduleInstance => {
      this.#modules[name] = moduleInstance
      this.emit('moduleLoaded', name)
    })
  }

  unload (name: string): void {
    if (!this.listModules().includes(name)) {
      return
    }

    ModuleLoader.unload(name)

    this.emit('moduleUnloaded', name)
  }

  listModules (): string[] {
    const moduleFolders = getDirectories(USER_MODULES_DIR)
      .filter(value => existsSync(join(USER_MODULES_DIR, `${value}/${value}.js`)))

    return moduleFolders.concat(Object.keys(SYSTEM_MODULES))
  }

  listLoadedModules (): string[] {
    return Object.keys(this.#modules)
  }

  getModule<T extends keyof AppModules | string>(name: T): (T extends keyof AppModules ? AppModules[T] : AbstractModule) | null {
    return (this.#modules[name] ?? null) as (T extends keyof AppModules ? AppModules[T] : AbstractModule) | null
  }

  unloadAll (): void {
    ModuleManager._info('Unloading all modules')
    const userModules = this.listLoadedModules()
    userModules.forEach((name) => {
      ModuleManager._debug(`Unloading module ${name}`)
      this.unload(name)
    })

    this.listLoadedModules().forEach((name) => {
      ModuleManager._debug(`Unloading module ${name}`)
      this.unload(name)
    })
  }

  disable (name: string): void {
    const ConfigManager = app('ConfigManager')

    let config = this.#getConfig()

    if (config === null) {
      config = new ModuleManagerConfig()
    }

    if (!config.getDisabledModules().includes(name)) {
      config.disableModule(name)
      ConfigManager.writeConfig('core', config, 'moduleManager')
    }
  }

  enable (name: string): void {
    const ConfigManager = app('ConfigManager')

    let config = this.#getConfig()

    if (config === null) {
      config = new ModuleManagerConfig()
    }

    if (config.getDisabledModules().includes(name)) {
      config.enableModule(name)
      ConfigManager.writeConfig('core', config, 'moduleManager')
    }
  }

  getDisabledModules (): string[] {
    return this.#getConfig().getDisabledModules()
  }

  #getConfig (): ModuleManagerConfig {
    const ConfigManager = app('ConfigManager')
    const config = ConfigManager.readConfig('core', 'moduleManager')

    if (config === null) {
      return new ModuleManagerConfig()
    }

    return ModuleManagerConfigMapper.fromDataObject(config)
  }

  static _warning: ((message: string) => void)
  static _error: (message: string, e: Error | null) => void
  static _fatal: (message: string, e: Error | null) => void
  static _debug: (message: string) => void
  static _info: (message: string) => void
}

classLogger(ModuleManager)

export default ModuleManager

export const SystemModules = SYSTEM_MODULES

export class ModuleManagerConfig extends DataObject {
  constructor (data: { disabledModules: string[] } = { disabledModules: [] }) {
    super(data)
  }

  getDisabledModules (): string[] {
    return this.getField('disabledModules') ?? []
  }

  disableModule (name: string): void {
    const modules = this.getDisabledModules()

    if (modules.includes('name')) {
      return
    }

    modules.push(name)
    this.setField('disabledModules', modules)
  }

  enableModule (name: string): void {
    const modules = this.getDisabledModules()

    const index = modules.indexOf(name)
    if (index === -1) {
      return
    }

    modules.splice(index, 1)
    this.setField('disabledModules', modules)
  }
}

// DECLARATIONS
export interface ModuleManagerEvents extends EventsList {
  autoLoadFinished: () => void
  moduleLoaded: (moduleName: string) => void
  moduleUnloaded: (moduleName: string) => void
}

interface EventEmitterOptions {
  /**
     * Enables automatic capturing of promise rejection.
     */
  captureRejections?: boolean | undefined
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface AppModules {
    [key: string]: AbstractModule
  }
}
