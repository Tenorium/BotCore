export default class CliCommandAlreadyExist extends Error {
    constructor() {
        super('Core already initialized!');
        this.name = 'CommandAlreadyExistError';
        this.stack = (new Error).stack;
    }
}