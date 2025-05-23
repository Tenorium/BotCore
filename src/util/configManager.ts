import * as fs from 'fs'
import path from 'path'
import { DataObject } from '@tenorium/utilslib'

const dataPath = path.join(basePath, 'data')

if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath)
}

export default class ConfigManager {
  static readConfig (namespace: string, name: string | undefined = undefined): DataObject | null {
    const configPath = path.join(dataPath, `${namespace}/${name === undefined ? 'config.json' : `${name}.json`}`)

    if (!fs.existsSync(configPath)) {
      return null
    }

    return new DataObject(JSON.parse(fs.readFileSync(configPath).toString()))
  }

  /**
   *
   * @param {string} namespace
   * @param {DataObject} data
   * @param {string=} name
   * @param forceWrite
   */
  static writeConfig (namespace: string, data: DataObject, name: string | undefined = undefined, forceWrite: boolean = false): void {
    const configPath = path.join(dataPath, `${namespace}/${name === undefined ? 'config.json' : `${name}.json`}`)
    const noChangedData = Object.keys(data.getChangedData()).length === 0

    if (!fs.existsSync(path.join(dataPath, `${namespace}`))) {
      fs.mkdirSync(path.join(dataPath, `${namespace}`))
    }

    if (!forceWrite && noChangedData && fs.existsSync(configPath)) {
      return
    }

    fs.writeFileSync(configPath, data.toJSON(true))
  }
}
