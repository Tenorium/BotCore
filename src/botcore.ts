import path, { dirname } from 'path'
import getConfig from './init.d/init.config.js'
import colors from 'colors'
import autoUpdate from './init.d/init.autoupdate.js'
import fs from 'fs'
import {format} from 'util'
import { fileURLToPath } from 'url'
import {endTimer, startTimer} from "./util/time.js";

const currentScriptPath = dirname(fileURLToPath(import.meta.url))

let packageJsonFolderPath = currentScriptPath;

while (!fs.existsSync(path.join(packageJsonFolderPath, 'package.json'))) {
  packageJsonFolderPath = path.join(packageJsonFolderPath, '..');
}

global.basePath = packageJsonFolderPath;

const serviceLocator = (await import('./init.d/init.sl.js')).default

serviceLocator();

const config = await getConfig()

await autoUpdate()

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
})

const logFile = fs.createWriteStream(path.join(global.basePath, 'log.txt'), { flags: 'a' })

console.log = function () {
  let message = ''
  for (let i = 0; i < arguments.length; i++) {
    message += format(arguments[i]) + ' '
  }
  process.stdout.write(message.trim() + '\n')
  logFile.write(message.trim() + '\n')
}

console.log('Loading core...')

startTimer();
const initCore = (await import('./init.d/init.core.js')).default
endTimer("coreModuleImport");

startTimer()
await initCore(config)
endTimer("initCore");

// DECLARATION

declare global {
  var basePath: string
}
