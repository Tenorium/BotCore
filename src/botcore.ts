import path, { dirname } from 'path'
import colors from 'colors'
import fs from 'fs'
import { format } from 'util'
import { fileURLToPath } from 'url'
import { endTimer, startTimer } from './util/time.js'

const currentScriptPath = dirname(fileURLToPath(import.meta.url))

let packageJsonFolderPath = currentScriptPath

while (!fs.existsSync(path.join(packageJsonFolderPath, 'package.json'))) {
  packageJsonFolderPath = path.join(packageJsonFolderPath, '..')
}

global.basePath = packageJsonFolderPath
global.version = JSON.parse(fs.readFileSync(path.join(packageJsonFolderPath, 'package.json')).toString()).version

const serviceLocator = (await import('./init/init.sl.js')).default

serviceLocator()

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

startTimer()
const initCore = (await import('./init/init.core.js')).default
endTimer('coreModuleImport')

startTimer()
await initCore()
endTimer('initCore')

// DECLARATION

declare global {
  var basePath: string
  var version: string
}
