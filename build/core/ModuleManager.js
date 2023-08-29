import { join } from 'path';
import { existsSync } from 'fs';
import AbstractModule from './abstractModule.js';
import { classLogger, DataObject, EventEmitterWrapper, getDirectories } from 'utilslib';
const USER_MODULES_DIR = new URL('../../modules', import.meta.url).pathname;
const SYSTEM_MODULES_DIR = new URL('../../system-modules', import.meta.url).pathname;
let constructed = false;
class ModuleManager extends EventEmitterWrapper {
    #modules = {};
    static _className = 'ModuleManager';
    constructor(options) {
        if (constructed) {
            throw new Error('Use app(\'ModuleManager\') instead');
        }
        constructed = true;
        super(options);
    }
    async autoload() {
        const ConfigManager = app('ConfigManager');
        const modules = this.list();
        let disabledModules = [];
        const config = ConfigManager.readConfig('core', 'moduleManager');
        if (config !== null) {
            disabledModules = config.getField('disabledModules');
        }
        for (const module_ of modules) {
            if (disabledModules.includes(module_) === true) {
                ModuleManager._debug(`Module ${module_} is disabled, skipping.`);
                continue;
            }
            ModuleManager._debug(`Loading module ${module_}`);
            await this.load(module_);
        }
        this.emit('autoLoadFinished');
    }
    /**
       *
       * @param {string} name
       */
    async load(name) {
        if (Object.keys(this.#modules).includes(name)) {
            return true;
        }
        const path = this.#getModulePath(name);
        if (path === null) {
            ModuleManager._debug(`Path for module ${name} is unknown`);
            return false;
        }
        ModuleManager._debug(`Path for module ${name} is ${path}`);
        try {
            // TODO: Заменить на загрузку JSAR
            const module_ = (await import(path)).default;
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
            this.emit('moduleLoaded', name);
            return true;
        }
        catch (e) {
            // @ts-expect-error
            ModuleManager._error(`Error at loading module ${name}`, e);
        }
        return false;
    }
    unload(name) {
        if (!this.list().includes(name)) {
            return true;
        }
        const module = this.#modules[name];
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.#modules[name];
        module.module.unload();
        this.emit('moduleUnloaded', name);
        return true;
    }
    list() {
        const systemFolders = getDirectories(SYSTEM_MODULES_DIR);
        systemFolders.filter(value => existsSync(join(SYSTEM_MODULES_DIR, `${value}/${value}.js`)));
        const folders = getDirectories(USER_MODULES_DIR);
        folders.filter(value => existsSync(join(USER_MODULES_DIR, `${value}/${value}.js`)));
        return systemFolders.concat(folders);
    }
    listLoaded() {
        return Object.keys(this.#modules);
    }
    getModule(name) {
        return this.#modules[name]?.module ?? null;
    }
    unloadAll() {
        ModuleManager._info('Unloading all modules');
        const userModules = this.listLoaded().filter(value => !['cli'].includes(value));
        userModules.forEach((name) => {
            ModuleManager._debug(`Unloading module ${name}`);
            this.unload(name);
        });
        this.listLoaded().forEach((name) => {
            ModuleManager._debug(`Unloading module ${name}`);
            this.unload(name);
        });
    }
    disable(name) {
        const ConfigManager = app('ConfigManager');
        /** @type {ModuleManagerConfig|null} */
        let config = new ModuleManagerConfig(
        // @ts-expect-error
        (ConfigManager.readConfig('core', 'moduleManager')?.getData() ?? undefined));
        if (config === null) {
            config = new ModuleManagerConfig();
        }
        if (!config.getDisabledModules().includes(name)) {
            config.disableModule(name);
            ConfigManager.writeConfig('core', config, 'moduleManager');
        }
    }
    enable(name) {
        const ConfigManager = app('ConfigManager');
        /** @type {ModuleManagerConfig|null} */
        let config = new ModuleManagerConfig(
        // @ts-expect-error
        (ConfigManager.readConfig('core', 'moduleManager')?.getData() ?? undefined));
        if (config === null) {
            config = new ModuleManagerConfig();
        }
        if (config.getDisabledModules().includes(name)) {
            config.enableModule(name);
            ConfigManager.writeConfig('core', config, 'moduleManager');
        }
    }
    #getModulePath(name) {
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
    static _warning;
    static _error;
    static _fatal;
    static _debug;
    static _info;
}
classLogger(ModuleManager);
export default ModuleManager;
class ModuleManagerConfig extends DataObject {
    constructor(data = { disabledModules: [] }) {
        super(data);
    }
    getDisabledModules() {
        return this.getField('disabledModules');
    }
    disableModule(name) {
        const modules = this.getDisabledModules();
        if (modules.includes('name')) {
            return;
        }
        modules.push(name);
        this.setField('disabledModules', modules);
    }
    enableModule(name) {
        const modules = this.getDisabledModules();
        const index = modules.indexOf(name);
        if (index === -1) {
            return;
        }
        modules.splice(index, 1);
        this.setField('disabledModules', modules);
    }
}
