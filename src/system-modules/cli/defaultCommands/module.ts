import type CliModule from '../cli.js'
import { Command, CommandArgument } from '../../../util/commandCompleter.js'
import splitargs from 'splitargs'
import { listSubCommand } from './module/list.js'
import { unloadSubCommand } from './module/unload.js'
import { loadSubCommand } from './module/load.js'
import { reloadSubCommand } from './module/reload.js'
import { disableSubCommand } from './module/disable.js'

const subcommandsWithModuleNameArg = ['unload', 'load', 'reload', 'disable', 'enable']
// eslint-disable-next-line @typescript-eslint/ban-types
const subCommandsFunctions: Record<string, Function> = {
  list: listSubCommand,
  unload: unloadSubCommand,
  load: loadSubCommand,
  reload: reloadSubCommand,
  disable: disableSubCommand
}

export const addModuleManagerCommand = (cli: CliModule): void => {
  cli.addCommand(
    'module',
    input => {
      const args: string[] = splitargs(input).slice(1)
      const command: string | undefined = args.shift()
      const moduleName: string | undefined = args.shift()

      if (command === undefined) {
        console.log('Please, enter command!')
        return
      }

      if (!Object.keys(subCommandsFunctions).includes(command)) {
        console.log('Unknown command')
        return
      }

      if (subcommandsWithModuleNameArg.includes(command)) {
        if (moduleName === undefined || moduleName.length === 0) {
          console.log('Please, enter module name!')
          return false
        }

        subCommandsFunctions[command](moduleName)
      } else {
        subCommandsFunctions[command]()
      }
    },
    completer => {
      const moduleManager = app('ModuleManager')
      const baseCommand = new Command('module')
      const subCommand = new CommandArgument(() => ['list', 'unload', 'load', 'reload', 'disable', 'enable'])
      const moduleNameArgument = new CommandArgument(enteredArgs => {
        if (enteredArgs[0] === 'list') {
          return []
        }

        return moduleManager.listModules()
      })

      baseCommand.addArgument(subCommand)
      baseCommand.addArgument(moduleNameArgument)

      completer.addCommand(baseCommand)
    }
  )
}
