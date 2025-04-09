import { ModuleManagerConfig } from '../../core/moduleSystem/moduleManager.js'
import { type DataObject } from '@tenorium/utilslib'

export class ModuleManagerConfigMapper {
  public static fromDataObject (data: DataObject): ModuleManagerConfig {
    return new ModuleManagerConfig({
      disabledModules: data.getField('disabledModules') ?? []
    })
  }
}
