import Core from '../core/core.js'
import ModuleManager from '../core/moduleSystem/moduleManager.js'

export default async function (): Promise<void> {
  console.log('Initializing Core...')
  const moduleManagerClass = new ModuleManager()
  app('ServiceLocator').register('ModuleManager', moduleManagerClass)

  const core = new Core()
  app('ServiceLocator').register('Core', core)
  core.init()
}

declare global {
  interface AppServices {
    Core: Core
    ModuleManager: ModuleManager
  }
}
