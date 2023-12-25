import CliModule from '../cli.js'
import splitargs from 'splitargs'
import { Command, CommandArgument } from '../../../util/commandCompleter'

export const addCommandManagerCommand = (cli: CliModule): void => {
  cli.addCommand('command',
    function (input) {
      const args: string[] = splitargs(input).slice(1)
      const command: string | undefined = args.shift()
      const commandName: string | undefined = args.shift()

      const CommandManager = app('CommandManager')

      const checkCommand = function (): boolean {
        if (commandName === undefined || commandName.length === 0) {
          console.log('Please, enter command name!')
          return false
        }

        if (!CommandManager.listCommands().includes(commandName)) {
          console.log('Command don\'t exists!')
          return false
        }

        return true
      }

      switch (command) {
        case 'disable':
          if (!checkCommand()) {
            return
          }

          // @ts-expect-error
          CommandManager.disableCommand(commandName)
          console.log('Command disabled!')
          return
        case 'enable':
          if (!checkCommand()) {
            return
          }

          // @ts-expect-error
          CommandManager.enableCommand(commandName)
          console.log('Command enabled!')
          return
        case 'list':
          console.log(
            CommandManager.listCommands()
              .map(value => (CommandManager.isDisabled(value) ? '[OFF] ' : '[ON] ') + value)
              .join('\n')
          )
      }
    },
    function (completer) {
      const baseCommand = new Command('command')
      const subCommand = new CommandArgument(() => ['disable', 'enable', 'list'])
      const commandNameArgument = new CommandArgument((enteredArgs) => {
        if (enteredArgs[0] === 'list') {
          return []
        }

        return app('CommandManager').listCommands()
      })

      baseCommand.addArgument(subCommand)
      baseCommand.addArgument(commandNameArgument)

      completer.addCommand(baseCommand)
    })
}
