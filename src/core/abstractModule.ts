export default class AbstractModule {
  load (): void {
    throw new Error("Method 'load()' must be implemented.")
  }

  unload (): void {
    // bye
  }
}
