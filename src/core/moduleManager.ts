import { join } from 'path'
import { existsSync } from 'fs'
import AbstractModule from './abstractModule.js'
import {
  arrayIncludesAll,
  classLogger,
  DataObject,
  EventEmitterWrapper,
  EventsList,
  getDirectories,
  uniqueArray
} from '@tenorium/utilslib'
import { fileURLToPath, pathToFileURL } from 'url'

const USER_MODULES_DIR = fileURLToPath(new URL('../../modules', import.meta.url))
const SYSTEM_MODULES_DIR = fileURLToPath(new URL('../system-modules', import.meta.url))

const DEFAULT_DISABLED_MODULES: string[] = ['test']
const PROTECTED_MODULES: string[] = ['cli']

let constructed = false

class ModuleManager extends EventEmitterWrapper<ModuleManagerEvents> {
  #modules: Record<string, { path: string, module: AbstractModule }> = {}
  static _className = 'ModuleManager'

  constructor (options?: EventEmitterOptions) {
    if (constructed) {
      throw new Error('Use app(\'ModuleManager\') instead')
    }

    constructed = true

    super(options)
  }

  async autoload (): Promise<void> {
    const ConfigManager = app('ConfigManager')
    const modules = this.list()
    let disabledModules: string[] = []

    const config = new ModuleManagerConfig(
      // @ts-expect-error
      (ConfigManager.readConfig('core', 'moduleManager')?.getData() ?? undefined)
    )
    if (config !== null) {
      disabledModules = config.getDisabledModules()
    }

    for (const module_ of modules) {
      if (disabledModules.includes(module_)) {
        ModuleManager._debug(`Module ${module_} is disabled, skipping.`)
        continue
      }
      ModuleManager._debug(`Loading module ${module_}`)
      await this.load(module_)
    }

    this.emit('autoLoadFinished')
  }

  /**
     *
     * @param {string} name
     */
  async load (name: string): Promise<boolean> {
    if (Object.keys(this.#modules).includes(name)) {
      return true
    }

    let path = this.#getModulePath(name)

    if (path !== null && process.platform === 'win32') {
      path = pathToFileURL(path).toString()
    }

    if (path === null) {
      ModuleManager._debug(`Path for module ${name} is unknown`)
      return false
    }
    ModuleManager._debug(`Path for module ${name} is ${path}`)

    try {
      // TODO: Заменить на загрузку JSAR

      const module_ = (await import(path)).default
      if (module_ === undefined) {
        ModuleManager._error('Error at loading module', new Error(`Module ${name} not have a default class`))
      }

      if (!(module_.prototype instanceof AbstractModule)) {
        ModuleManager._error('Error at loading module', new Error(`Module ${name} not extends AbstractModule class`))
      }

      /** @type {AbstractModule} */
      // eslint-disable-next-line new-cap
      const moduleclass = new module_()

      moduleclass.load()
      this.#modules[name] = {
        path,
        module: moduleclass
      }

      this.emit('moduleLoaded', name)

      return true
    } catch (e) {
      // @ts-expect-error
      ModuleManager._error(`Error at loading module ${name}`, e)
    }

    return false
  }

  unload (name: string): boolean {
    if (!this.list().includes(name)) {
      return true
    }

    const module = this.#modules[name]
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.#modules[name]

    module.module.unload()
    this.emit('moduleUnloaded', name)
    return true
  }

  list (): string[] {
    const systemFolders = getDirectories(SYSTEM_MODULES_DIR)
    systemFolders.filter(value => existsSync(join(SYSTEM_MODULES_DIR, `${value}/${value}.js`)))
    const folders = getDirectories(USER_MODULES_DIR)
    folders.filter(value => existsSync(join(USER_MODULES_DIR, `${value}/${value}.js`)))

    return systemFolders.concat(folders)
  }

  listLoaded (): string[] {
    return Object.keys(this.#modules)
  }

  // TODO: Dynamic types
  getModule (name: string): AbstractModule | null {
    return this.#modules[name]?.module ?? null
  }

  unloadAll (): void {
    ModuleManager._info('Unloading all modules')
    const userModules = this.listLoaded().filter(value => !PROTECTED_MODULES.includes(value))
    userModules.forEach((name) => {
      ModuleManager._debug(`Unloading module ${name}`)
      this.unload(name)
    })

    this.listLoaded().forEach((name) => {
      ModuleManager._debug(`Unloading module ${name}`)
      this.unload(name)
    })
  }

  disable (name: string): void {
    if (PROTECTED_MODULES.includes(name)) {
      throw new Error(`Module ${name} is protected and can't be disabled`)
    }

    const ConfigManager = app('ConfigManager')

    /** @type {ModuleManagerConfig|null} */
    let config = new ModuleManagerConfig(
      // @ts-expect-error
      (ConfigManager.readConfig('core', 'moduleManager')?.getData() ?? undefined)
    )

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

    /** @type {ModuleManagerConfig|null} */
    let config = new ModuleManagerConfig(
      // @ts-expect-error
      (ConfigManager.readConfig('core', 'moduleManager')?.getData() ?? undefined)
    )

    if (config === null) {
      config = new ModuleManagerConfig()
    }

    if (config.getDisabledModules().includes(name)) {
      config.enableModule(name)
      ConfigManager.writeConfig('core', config, 'moduleManager')
    }
  }

  #getModulePath (name: string): string | null {
    const systemPath = join(SYSTEM_MODULES_DIR, `${name}/${name}.js`)
    const userPath = join(USER_MODULES_DIR, `${name}/${name}.js`)

    if (existsSync(systemPath)) {
      return systemPath
    }

    if (existsSync(userPath)) {
      return userPath
    }

    return null
  }

  static _warning: ((message: string) => void)
  static _error: (message: string, e: Error | null) => void
  static _fatal: (message: string, e: Error | null) => void
  static _debug: (message: string) => void
  static _info: (message: string) => void
}

classLogger(ModuleManager)

export default ModuleManager

class ModuleManagerConfig extends DataObject {
  constructor (data: { disabledModules: string[] } = { disabledModules: DEFAULT_DISABLED_MODULES }) {
    super(data)
  }

  getDisabledModules (): string[] {
    let data: string[] = this.getField('disabledModules')

    if (!arrayIncludesAll(DEFAULT_DISABLED_MODULES, data)) {
      data = uniqueArray([
        ...DEFAULT_DISABLED_MODULES, ...data
      ])
    }

    return data
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
