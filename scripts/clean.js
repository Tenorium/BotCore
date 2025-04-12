import fs from 'fs'
import { Logger } from '@tenorium/utilslib'

if (!fs.existsSync('build')) {
  Logger.info('No build files found!')
  process.exit(0);
}

fs.rmdirSync('build')

Logger.info('Build files cleared!')
