import fs from 'fs'
import { Logger } from '@tenorium/utilslib'

if (!fs.existsSync('build')) {
  Logger.info('No build files found!')
  process.exit(0)
}

fs.rmSync('build', {
  recursive: true,
  force: true
})

Logger.info('Build files cleared!')
