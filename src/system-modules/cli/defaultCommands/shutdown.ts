import CliModule from '../cli.js'
import { Command, CommandCompleter } from '../../../util/commandCompleter'

export const addShutdownCommand = (cli: CliModule): void => {
  const handler = function (input: string): void {
    console.log('Shutdown...')
    app('Core').shutdown()
  }

  const completerCallback = function (completer: CommandCompleter): void {
    completer.addCommand(new Command('shutdown'))
  }

  cli.addCommand('shutdown', handler, completerCallback)
  cli.addCommand('exit', handler, completerCallback)
}
