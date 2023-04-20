import * as fs from 'fs';
import path, { dirname } from 'path';

const currentPath = dirname(new URL('', import.meta.url).pathname);

export default class ConfigManager {
  static #configs = {};
  /**
     *
     * @param {string} namespace
     * @param {string=} name
     * @return {*|null}
     */
  static readConfig (namespace, name) {
    if (args.worker) {
      return this.#configs[namespace][name === undefined ? 'config' : name] ?? null;
    }

    const configPath = path.join(currentPath, `${namespace}/${name === undefined ? 'config.json' : `${name}.json`}`);

    if (!fs.existsSync(configPath)) {
      return null;
    }

    return JSON.parse(fs.readFileSync(configPath).toString());
  }

  /**
     *
     * @param {string} namespace
     * @param data
     * @param {string=} name
     */
  static writeConfig (namespace, data, name = undefined) {
    if (args.worker) {
      this.#configs[namespace][name === undefined ? 'config' : name] = data;
      return;
    }

    const configPath = path.join(currentPath, `${namespace}/${name === undefined ? 'config.json' : `${name}.json`}`);

    if (!fs.existsSync(path.join(currentPath, `${namespace}`))) {
      fs.mkdirSync(path.join(currentPath, `${namespace}`));
    }

    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
  }

  static getConfigObject () {
    const object = {};

    fs.readdirSync(currentPath, {
      withFileTypes: true
    }).forEach(namespace => {
      if (namespace.name === 'index.js') return;

      object[namespace.name] = {};

      fs.readdirSync(path.join(currentPath, namespace.name), {
        withFileTypes: true
      }).forEach(configName => {
        object[namespace.name][configName.name.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(currentPath, `${namespace.name}/${configName.name}`)));
      });
    });

    return object;
  }

  static setConfigObject (confObject) {
    this.#configs = confObject;
  }
}
