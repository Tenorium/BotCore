import { join } from 'path';
import fs, { existsSync } from 'fs';
import { ClassLogger } from '#util/log';
import AbstractModule from '#abstractModule';
import { getDirectories } from '#util/utils';
import ModuleEventEmitter from './event.js';
import { parse } from 'comment-parser';
import dependencyResolver from '#util/dependency-resolver';
import ConfigManager from '#configManager';

const USER_MODULES_DIR = new URL('../../modules', import.meta.url).pathname;
const SYSTEM_MODULES_DIR = new URL('../../system-modules', import.meta.url).pathname;

export default class ModuleManager extends ClassLogger {
  static #modules = {};
  static #em = new ModuleEventEmitter();
  static _className = 'ModuleManager';

  static async autoload () {
    const modules = this.list();
    let disabledModules = [];

    const config = ConfigManager.readConfig('core', 'moduleManager');
    if (config !== null) {
      disabledModules = config.disabledModules;
    }

    for (const module_ of modules) {
      if (disabledModules.includes(module_)) {
        this._debug(`Module ${module_} disabled, skipping.`);
        continue;
      }
      this._debug(`Loading module ${module_}`);
      await this.load(module_);
    }
    this.getEventManager().emit('autoLoadFinished');
  }

  /**
     *
     * @param {string} name
     */
  static async load (name) {
    if (Object.keys(this.#modules).includes(name)) {
      return true;
    }

    const path = this.#getModulePath(name);
    this._debug(`Path for module ${name} is ${path}`);
    if (!path) {
      return false;
    }

    try {
      const moduleSource = fs.readFileSync(path).toString('utf-8');

      this._debug('Parsing module source for get metadata');
      const { tags } = parse(moduleSource)[0] ?? { tags: [] };

      let dependencies = {};

      tags.forEach((/** import('comment-parser').Spec */ tag) => {
        if (tag.tag === 'dependencies') {
          dependencies = JSON.parse(tag.type);
        }
      });

      await dependencyResolver(dependencies);

      this._debug('Dependencies installed');

      const module_ = (await import(`${path}?update=${Date.now()}`)).default;
      if (!(module_.prototype instanceof AbstractModule)) {
        throw new Error('Module not extends AbstractModule class');
      }

      /** @type {AbstractModule} */
      // eslint-disable-next-line new-cap
      const moduleclass = new module_();

      moduleclass.load();
      this.#modules[name] = {
        path,
        module: moduleclass
      };

      this.getEventManager().emit('moduleLoaded', name);

      return true;
    } catch (e) {
      this._error(`Error at loading module ${name}`, e)
    }

    return false;
  }

  /**
     *
     * @param {string} name
     * @return {boolean}
     */
  static unload (name) {
    if (!this.listLoaded().includes(name)) {
      return true;
    }

    const module_ = this.#modules[name];
    delete this.#modules[name];

    module_.module.unload();
    this.getEventManager().emit('moduleUnloaded', name);
  }

  /**
     *
     * @return {string[]}
     */
  static list () {
    const systemFolders = getDirectories(SYSTEM_MODULES_DIR);
    systemFolders.filter(value => existsSync(join(SYSTEM_MODULES_DIR, `${value}/${value}.js`)));
    const folders = getDirectories(USER_MODULES_DIR);
    folders.filter(value => existsSync(join(USER_MODULES_DIR, `${value}/${value}.js`)));

    return systemFolders.concat(folders);
  }

  /**
     * @return {string[]}
     */
  static listLoaded () {
    return Object.keys(this.#modules);
  }

  static getModule (name) {
    return this.#modules[name]?.module ?? null;
  }

  static unloadAll () {
    this._info('Unloading all modules');
    const userModules = this.listLoaded().filter(value => !['cli'].includes(value));
    userModules.forEach((name) => {
      this._debug(`Unloading module ${name}`);
      this.unload(name);
    });

    this.listLoaded().forEach((name) => {
      this._debug(`Unloading module ${name}`);
      this.unload(name);
    });
  }

  static disable (name) {
    let config = ConfigManager.readConfig('core', 'moduleManager');

    if (config === null) {
      config = {
        disabledModules: []
      }
    }

    if (!config.disabledModules.includes(name)) {
      config.disabledModules.push(name);
      ConfigManager.writeConfig('core', config, 'moduleManager');
    }
  }

  static enable (name) {
    let config = ConfigManager.readConfig('core', 'moduleManager');

    if (config === null) {
      config = {
        disabledModules: []
      }
      return;
    }

    let index;

    if ((index = config.disabledModules.indexOf(name)) !== -1) {
      if (index !== -1) {
        config.disabledModules.splice(index, 1);
        ConfigManager.writeConfig('core', config, 'moduleManager');
      }
    }
  }

  static getEventManager () {
    return this.#em;
  }

  static #getModulePath (name) {
    const systemPath = join(SYSTEM_MODULES_DIR, `${name}/${name}.js`);
    const userPath = join(USER_MODULES_DIR, `${name}/${name}.js`);
    if (existsSync(systemPath)) {
      return systemPath;
    }

    if (existsSync(userPath)) {
      return userPath;
    }

    return null;
  }
}
