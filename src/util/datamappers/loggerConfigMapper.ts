import { LoggerConfig, type DataObject } from '@tenorium/utilslib'

export default class LoggerConfigMapper {
  static fromDataObject (data: DataObject): LoggerConfig {
    return new LoggerConfig({
      debug: data.getField('debug'),
      dateformat: data.getField('dateformat')
    })
  }
}
