export default class CommandAlreadyRegisteredError extends Error {
    constructor() {
        super('Command already registered')
        this.name = 'CommandAlreadyRegistered'
        this.stack = (new Error()).stack
    }
}
