import readline from 'readline'
import AbstractModule from '../../core/abstractModule.js'
import { Logger } from '@tenorium/utilslib'
import { run } from './defaultCommands.js'
import splitargs from 'splitargs'
import { CommandCompleter } from '../../util/commandCompleter.js'

let rl: readline.Interface
let isClosed = false

const commands: Record<string, CommandHandler> = {}

const commandHandler = function (input: string): void {
  const args = splitargs(input)
  const command = args.shift()

  if (command === undefined) {
    return
  }

  if (commands[command] === undefined) {
    return
  }

  commands[command](input)
}

export default class CliModule extends AbstractModule {
  #completer: CommandCompleter = new CommandCompleter()
  load (): void {
    const ModuleManager = app('ModuleManager')

    Logger.info('CLI module loading!')

    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: this.#completer.completer()
    })

    rl.on('line', function (input: string): void {
      rl.pause()
      commandHandler(input)
      if (isClosed) {
        return
      }

      rl.resume()
      rl.prompt()
    })
    rl.addListener('close', () => {
      isClosed = true
    })
    rl.addListener('SIGINT', function () {
      app('Core').shutdown()
    })

    run(this)

    ModuleManager.once('autoLoadFinished', () => {
      rl.prompt()
    })
  }

  addCommand (command: string, commandHandler: CommandHandler, completerCallback?: CompleterCallback): void {
    if (completerCallback !== undefined) {
      try {
        completerCallback(this.#completer)
      } catch (e) {
        // @ts-expect-error
        Logger.error('Error in CLI add command function', e)
      }
    }
    commands[command] = commandHandler
  }

  removeCommand (command: string): void {
    this.getCompleter().removeCommand(command)
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete commands[command]
  }

  getCompleter (): CommandCompleter {
    return this.#completer
  }

  unload (): void {
    Logger.info('Closing CLI...')
    rl.close()
  }
}

// DECLARATIONS

export type CommandHandler = (input: string) => void
export type CompleterCallback = (completer: CommandCompleter) => void

declare global {
  interface AppModules {
    cli: CliModule
  }
}
