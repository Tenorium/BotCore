import type IModuleManifest from './moduleManifest.js'

export default class AbstractModule {
  load (): void {
    throw new LoadMethodNotImplemented()
  }

  unload (): void {
    // bye
  }

  static getManifest (): IModuleManifest {
    throw new ManifestNotImplemented()
  }
}

export class LoadMethodNotImplemented extends Error {
  constructor () {
    super("Method 'load()' must be implemented.")
  }
}

export class ManifestNotImplemented extends Error {
  constructor () {
    super("Method 'getManifest()' must be implemented.")
  }
}
