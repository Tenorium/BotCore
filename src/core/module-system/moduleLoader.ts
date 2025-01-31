import { join } from 'path'
import { existsSync } from 'fs'
import { pathToFileURL } from 'url'
import AbstractModule from './abstractModule.js'
import { Logger } from '@tenorium/utilslib'

export const USER_MODULES_DIR = join(basePath, 'modules')

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
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
      const module_: AbstractModule | any = (await import(path)).default
      if (module_ === undefined) {
        Logger.error('Error at loading module', new Error(`Module ${name} not have a default class`))
      }

      if (!(module_.prototype instanceof AbstractModule)) {
        Logger.error('Error at loading module', new Error(`Module ${name} not extends AbstractModule class`))
      }

      // eslint-disable-next-line new-cap
      const moduleclass: AbstractModule = new module_()

      moduleclass.load()
      saveCallback(moduleclass)
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      Logger.error(`Error at loading module ${name}`, e)
    }
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
