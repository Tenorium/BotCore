import splitargs from 'splitargs'

export class CommandCompleter {
  readonly #commands: Record<string, Command> = {}

  constructor () {
    this.#commands = {}
  }

  completer (): (command: string) => [string[] | string | [], string] {
    return (command: string): [string[] | string | [], string] => {
      return this.complete(command)
    }
  }

  complete (command: string): [string[] | string | [], string] {
    const parsedCmd = splitargs(command)[0] ?? null

    if (parsedCmd === null) {
      return [this.listCommandNames(), command]
    }

    const cmd = this.getCommand(parsedCmd)

    if (cmd == null) {
      const matches = this.listCommandNames()
        .filter(c => c.startsWith(parsedCmd))

      return [(matches.length > 0) ? matches : this.listCommandNames(), command]
    }

    const args = splitargs(command).slice(1)

    const argIndex = this.#getCurrentArgIndex(cmd, args)

    if (argIndex === -1) {
      return [[], command]
    }

    const argOptions = cmd.getArguments()[argIndex].getValueList(args)

    const prefix = args[argIndex] ?? ''

    if (prefix === '') {
      return [
        argOptions.map(argOption => parsedCmd + ' ' + args.slice(0, argIndex).join(' ') + ' ' + argOption),
        command
      ]
    }

    const matches = argOptions.filter(opt =>
      opt.startsWith(prefix)
    )

    return [
      (matches.length > 0)
        ? matches
        : argOptions, prefix
    ]
  }

  addCommand (command: Command): void {
    this.#commands[command.name] = command
  }

  getCommand (commandName: string): Command | undefined {
    return this.#commands[commandName]
  }

  listCommandNames (): string[] {
    return Object.keys(this.#commands)
  }

  #getCurrentArgIndex (cmd: Command, args: string[]): number {
    const validArguments = cmd.getArguments()

    const argIndex = validArguments.findIndex((validArg, index) => {
      const arg = args[index]
      if (index >= validArguments.length) {
        // Если индекс аргумента превышает количество аргументов команды, значит, все аргументы валидны.
        return false
      }

      const argument = validArguments[index]
      return !argument.getValueList(args).includes(arg)
    })

    return argIndex >= 0 ? argIndex : -1
  }
}

export class Command {
  readonly #name: string = ''
  #args: CommandArgument[] = []

  constructor (commandName: string) {
    this.#name = commandName
  }

  get name (): string {
    return this.#name
  }

  addArgument (argument: CommandArgument): void {
    this.#args.push(argument)
  }

  removeArgument (argIndex: number): void {
    this.#args.splice(argIndex, 1)
  }

  getArguments (): CommandArgument[] {
    return this.#args
  }
}

export class CommandArgument {
  readonly #valueListCallback: (enteredArgs: string[]) => string[]

  constructor (valueListCallback: (enteredArgs: string[]) => string[]) {
    this.#valueListCallback = valueListCallback
  }

  getValueList (enteredArgs: string[]): string[] {
    return this.#valueListCallback(enteredArgs)
  }
}
