export default class AbstractModule {
  load (): void {
    throw new LoadMethodNotImplemented()
  }

  unload (): void {
    // bye
  }
}

export class LoadMethodNotImplemented extends Error {
  constructor () {
    super("Method 'load()' must be implemented.")
  }
}
