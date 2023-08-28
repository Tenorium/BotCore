import semver from 'semver'
import fs from 'fs'
import { dirname } from 'path'
global.basePath = dirname(new URL('../', import.meta.url).pathname)
const { engines } = JSON.parse(fs.readFileSync('./package.json').toString())
const version = engines.node
if (typeof version !== 'string') {
  throw new Error('Missing engines.node in package.json')
}
if (!semver.satisfies(process.version, version)) {
  console.log(`Required node version ${version} not satisfied with current version ${process.version}.`)
  process.exit(1)
}
