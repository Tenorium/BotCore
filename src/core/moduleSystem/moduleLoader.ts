import { join } from 'path'
import { existsSync } from 'fs'
import { pathToFileURL } from 'url'
import AbstractModule from './abstractModule.js'
import { Logger } from '@tenorium/utilslib'
import { SystemModules } from './moduleManager.js'

export const USER_MODULES_DIR = join(basePath, 'modules')

export default class ModuleLoader {
  static async load (name: string, saveCallback: (moduleInstance: AbstractModule) => void): Promise<void> {
    let path = this.#getModulePath(name)

    if (path !== null && process.platform === 'win32') {
      path = pathToFileURL(path).toString()
    }

    if (path === null) {
      Logger.debug(`Path for module ${name} is unknown`)
      return
    }

    Logger.debug(`Path for module ${name} is ${path}`)

    try {
      const Module_: AbstractModule | any = (await import(path)).default
      if (Module_ === undefined) {
        Logger.error('Error at loading module', new Error(`Module ${name} not have a default class`))
      }

      if (!(Module_.prototype instanceof AbstractModule)) {
        Logger.error('Error at loading module', new Error(`Module ${name} not extends AbstractModule class`))
      }

      const moduleclass: AbstractModule = new Module_()

      moduleclass.load()
      saveCallback(moduleclass)
    } catch (e) {
      if (e instanceof Error) {
        Logger.error(`Error at loading module ${name}`, e)
      }

      Logger.error(`Error at loading module ${name}`)
    }
  }

  static loadSystemModule (name: string, saveCallback: (moduleInstance: AbstractModule) => void): void {
    if (!Object.keys(SystemModules).includes(name)) {
      return
    }
    const moduleInstance = new SystemModules[name]()
    moduleInstance.load()
    saveCallback(moduleInstance)
  }

  static unload (name: string): void {
    const ModuleManager = app('ModuleManager')

    const module = ModuleManager.getModule(name)
    if (module === null) {
      return
    }

    module.unload()
  }

  static #getModulePath (name: string): string | null {
    const path = join(USER_MODULES_DIR, `${name}/${name}.js`)
    if (existsSync(path)) {
      return path
    }

    return null
  }
}
