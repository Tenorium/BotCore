export default class EventNotFoundError extends Error {
  constructor () {
    super('Event not found!')
    this.name = 'EventNotFoundError'
    this.stack = (new Error()).stack
  }
}
