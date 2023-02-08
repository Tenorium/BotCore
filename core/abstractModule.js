export default class AbstractModule {
  load () {
    throw new Error("Method 'load()' must be implemented.")
  }

  unload () {
    // bye
  }
}
