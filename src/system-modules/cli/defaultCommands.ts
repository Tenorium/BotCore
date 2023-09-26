import CliModule from './cli.js'
import { addShutdownCommand } from './defaultCommands/shutdown.js'
import { addCommandManagerCommand } from './defaultCommands/command.js'
import { addModuleManagerCommand } from './defaultCommands/module.js'

export const run = function (cli: CliModule): void {
  addShutdownCommand(cli)
  addCommandManagerCommand(cli)
  addModuleManagerCommand(cli)
}
