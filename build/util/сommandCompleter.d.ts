export declare class CommandCompleter {
    #private;
    constructor();
    completer(): (command: string) => [string[] | string | [], string];
    complete(command: string): [string[] | string | [], string];
    addCommand(command: Command): void;
    removeCommand(commandName: string): void;
    getCommand(commandName: string): Command | undefined;
    listCommandNames(): string[];
}
export declare class Command {
    #private;
    constructor(commandName: string);
    get name(): string;
    addArgument(argument: CommandArgument): void;
    removeArgument(argIndex: number): void;
    getArguments(): CommandArgument[];
}
export declare class CommandArgument {
    #private;
    constructor(valueListCallback: () => string[]);
    get valueList(): string[];
}
