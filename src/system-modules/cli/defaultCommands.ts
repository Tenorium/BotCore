import type CliModule from './cli.js'
import { addShutdownCommand } from './defaultCommands/shutdown.js'
import { addModuleManagerCommand } from './defaultCommands/module.js'

export const run = function (cli: CliModule): void {
  addShutdownCommand(cli)
  addModuleManagerCommand(cli)
}
