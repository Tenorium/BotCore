import Core from '../core/core.js'
import { CoreConfig } from './init.config.js'
import ModuleManager from '../core/ModuleManager.js'

export default async function (config: CoreConfig): Promise<void> {
  const moduleManagerClass = new ModuleManager()
  app('ServiceLocator').register('ModuleManager', moduleManagerClass)

  const core = new Core(config)
  app('ServiceLocator').register('Core', core)
}

declare global {
  interface AppServices {
    Core: Core
    ModuleManager: ModuleManager
  }
}
