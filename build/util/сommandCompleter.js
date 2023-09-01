import splitargs from 'splitargs';
export class CommandCompleter {
    #commands = {};
    constructor() {
        this.#commands = {};
    }
    completer() {
        return (command) => {
            return this.complete(command);
        };
    }
    complete(command) {
        const parsedCmd = splitargs(command)[0] ?? null;
        if (parsedCmd === null) {
            return [this.listCommandNames(), command];
        }
        const cmd = this.getCommand(parsedCmd);
        if (cmd == null) {
            const matches = this.listCommandNames()
                .filter(c => c.startsWith(parsedCmd));
            return [(matches.length > 0) ? matches : this.listCommandNames(), command];
        }
        const args = splitargs(command).slice(1);
        const argIndex = this.#getCurrentArgIndex(cmd, args);
        if (argIndex === -1) {
            return [[], command];
        }
        const argOptions = cmd.getArguments()[argIndex].valueList;
        const prefix = args[argIndex] ?? '';
        if (prefix === '') {
            return [argOptions, command];
        }
        const matches = argOptions.filter(opt => opt.startsWith(prefix));
        return [(matches.length > 0) ? matches : argOptions, prefix];
    }
    addCommand(command) {
        this.#commands[command.name] = command;
    }
    removeCommand(commandName) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.#commands[commandName];
    }
    getCommand(commandName) {
        return this.#commands[commandName];
    }
    listCommandNames() {
        return Object.keys(this.#commands);
    }
    #getCurrentArgIndex(cmd, args) {
        const validArguments = cmd.getArguments();
        const argIndex = validArguments.findIndex((validArg, index) => {
            const arg = args[index];
            if (index >= validArguments.length) {
                // Если индекс аргумента превышает количество аргументов команды, значит, все аргументы валидны.
                return false;
            }
            const argument = validArguments[index];
            return !argument.valueList.includes(arg);
        });
        return argIndex >= 0 ? argIndex : -1;
    }
}
export class Command {
    #name = '';
    #args = [];
    constructor(commandName) {
        this.#name = commandName;
    }
    get name() {
        return this.#name;
    }
    addArgument(argument) {
        this.#args.push(argument);
    }
    removeArgument(argIndex) {
        this.#args.splice(argIndex, 1);
    }
    getArguments() {
        return this.#args;
    }
}
export class CommandArgument {
    #valueListCallback;
    constructor(valueListCallback) {
        this.#valueListCallback = valueListCallback;
    }
    get valueList() {
        return this.#valueListCallback();
    }
}
