import {join} from "path";
import {existsSync} from "fs";
import Logger from "../../util/log.js";
import AbstractModule from "../abstractModule.js";
import {getDirectories} from "../../util/utils.js";
import EventEmitter from "events";

const USER_MODULES_DIR = new URL('../../modules', import.meta.url).pathname;
const SYSTEM_MODULES_DIR = new URL('../../system-modules', import.meta.url).pathname;

export class ModuleEventsEmitter extends EventEmitter {
    constructor() {
        super();
    }
}

export default class ModuleManager {
    static #modules = {};
    static #em = new ModuleEventsEmitter();

    static async autoload() {
        let modules = this.list();

        for (const module_ of modules) {
            Logger.debug(`[ModuleManager] Loading module ${module_}`);
            await this.load(module_);
        }
        this.getEventManager().emit('autoLoadFinished');
    }

    /**
     *
     * @param {string} name
     */
    static async load(name) {
        if (Object.keys(this.#modules).includes(name)) {
            return true;
        }

        let path = this.#getModulePath(name);
        Logger.debug(`[ModuleManager] Path for module ${name} is ${path}`)
        if (!path) {
            return false;
        }

        try {
            let module_ = (await import(path)).default;
            if (!(module_.prototype instanceof AbstractModule)) {
                throw new Error('Module not extends AbstractModule class')
            }

            /** @type {AbstractModule} */
            let moduleclass = new module_();


            moduleclass.load();
            this.#modules[name] = {
                path: path,
                module: moduleclass
            }

            this.getEventManager().emit('moduleLoaded', name);

            return true;
        } catch (e) {
            Logger.error(`Error at loading module ${name}`, e);
        }

        return false;
    }

    /**
     *
     * @param {string} name
     * @return {boolean}
     */
    static unload(name) {
        if (!this.list().includes(name)) {
            return true;
        }

        let module = this.#modules[name];
        delete this.#modules[name];

        module.module.unload();
        this.getEventManager().emit('moduleUnloaded', name);
    }

    /**
     *
     * @return {string[]}
     */
    static list() {
        let systemFolders = getDirectories(SYSTEM_MODULES_DIR);
        systemFolders.filter(value => existsSync(join(SYSTEM_MODULES_DIR, `${value}/${value}.js`)));
        let folders = getDirectories(USER_MODULES_DIR);
        folders.filter(value => existsSync(join(USER_MODULES_DIR, `${value}/${value}.js`)));

        return systemFolders.concat(folders);
    }

    /**
     * @return {string[]}
     */
    static listLoaded() {
        return Object.keys(this.#modules);
    }

    /**
     *
     * @param name
     * @return {AbstractModule|null}
     */
    static getModule(name) {
        return this.#modules[name]?.module ?? null;
    }

    static unloadAll() {
        Logger.info('Unloading all modules!');
        this.listLoaded().forEach((name) => {
            Logger.debug(`Unloading module ${name}`);
            this.unload(name);
        });
    }

    static getEventManager() {
        return this.#em;
    }

    static #getModulePath(name) {
        let systemPath = join(SYSTEM_MODULES_DIR, `${name}/${name}.js`);
        let userPath = join(USER_MODULES_DIR, `${name}/${name}.js`);
        if (existsSync(systemPath)) {
            return systemPath;
        }

        if (existsSync(userPath)) {
            return userPath;
        }

        return null;
    }
}