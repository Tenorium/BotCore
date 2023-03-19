export default class CoreAlreadyInitializedError extends Error {
  constructor () {
    super('Core already initialized!')
    this.name = 'CoreAlreadyInitializedError'
    this.stack = (new Error()).stack
  }
}
