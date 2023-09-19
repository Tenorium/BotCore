import path, { dirname } from 'path'
import getConfig from './init.d/init.config.js'
import colors from 'colors'
import autoUpdate from './init.d/init.autoupdate.js'
import fs from 'fs'
import * as util from 'util'
import { fileURLToPath } from 'url'

global.basePath = dirname(fileURLToPath(new URL('', import.meta.url)))

const serviceLocator = (await import('./init.d/init.sl.js')).default

serviceLocator()

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
    message += util.format(arguments[i]) + ' '
  }
  process.stdout.write(message.trim() + '\n')
  logFile.write(message.trim() + '\n')
}

const initCore = (await import('./init.d/init.core.js')).default

await initCore(config)

// DECLARATION

declare global {
  var basePath: string
}
