import { LoggerConfig, type DataObject } from '@tenorium/utilslib'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class LoggerConfigMapper {
  static fromDataObject (data: DataObject): LoggerConfig {
    return new LoggerConfig({
      debug: data.getField('debug'),
      dateformat: data.getField('dateformat')
    })
  }
}
