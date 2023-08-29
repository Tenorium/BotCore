import { DataObject } from 'utilslib';
export default class ConfigManager {
    static readConfig(namespace: string, name?: string | undefined): DataObject | null;
    /**
       *
       * @param {string} namespace
       * @param {DataObject} data
       * @param {string=} name
       */
    static writeConfig(namespace: string, data: DataObject, name?: string | undefined): void;
}
