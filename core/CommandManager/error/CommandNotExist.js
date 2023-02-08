export default class CommandNotExist extends Error {
    constructor() {
        super('Command not exist')
        this.name = 'CommandNotExist'
        this.stack = (new Error()).stack
    }
}
