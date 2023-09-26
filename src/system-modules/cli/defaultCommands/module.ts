import CliModule from '../cli.js'
import { Command, CommandArgument } from '../../../util/сommandCompleter.js'
import splitargs from 'splitargs'

export const addModuleManagerCommand = (cli: CliModule): void => {
  cli.addCommand('module',
    input => {
      const args: string[] = splitargs(input).slice(1)
      const command: string | undefined = args.shift()
      const moduleName: string | undefined = args.shift()

      const ModuleManager = app('ModuleManager')

      const checkModule = function (): boolean {
        if (moduleName === undefined || moduleName.length === 0) {
          console.log('Please, enter module name!')
          return false
        }

        if (!ModuleManager.list().includes(moduleName)) {
          console.log('Command don\'t exists!')
          return false
        }

        return true
      }

      switch (command) {
        case 'list':
          if (!checkModule()) {
            return
          }

          console.log(ModuleManager.list())
          return
        case 'unload':
          if (!checkModule()) {
            return
          }

          // @ts-expect-error
          ModuleManager.unload(moduleName)
          return
        case 'load':
          if (!checkModule()) {
            return
          }
          // @ts-expect-error
          void ModuleManager.load(moduleName)
          return
        case 'reload':
          if (!checkModule()) {
            return
          }
          // @ts-expect-error
          ModuleManager.unload(moduleName)
          // @ts-expect-error
          void ModuleManager.load(moduleName)
          return
        case 'disable':
          if (!checkModule()) {
            return
          }
          // @ts-expect-error
          ModuleManager.disable(moduleName)
          return
        case 'enable':
          if (!checkModule()) {
            return
          }
          // @ts-expect-error
          ModuleManager.enable(moduleName)
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

        return moduleManager.list()
      })

      baseCommand.addArgument(subCommand)
      baseCommand.addArgument(moduleNameArgument)

      completer.addCommand(baseCommand)
    })
}
