import Core from '../core/core.js'
import { CoreConfig } from './init.config.js'

export default async function (config: CoreConfig): Promise<void> {
  const core = new Core(config)
  app('ServiceLocator').register('Core', core)
  core.init()
}

declare global {
  interface AppServices {
    Core: Core
  }
}
