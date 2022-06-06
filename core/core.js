import ModuleManager from "./ModuleManager/index.js";
import {Client} from "discord.js";
import {v4 as uuidv4} from "uuid";
import Logger from "./log.js";
import CoreAlreadyInitializedError from "./error/CoreAlreadyInitializedError.js";
import CommandManager from "./CommandManager/index.js";
import EventNotFoundError from "./error/EventNotFoundError.js";
import i18n from "i18n";
let core;

export default class Core {
    #events = {};
    #config;
    #client;
    #initialized = false;

    constructor(config) {
        if (core) {
            return core;
        }

        this.#config = config;
        Logger.setConfig(this.#config.logger);
        core = this;
    }

    /**
     * Core initialization function
     */
    init() {
        if (this.#initialized) {
            throw new CoreAlreadyInitializedError();
        }

        Logger.debug("Core init started!");

        i18n.setLocale(this.#config.locale);

        this.#client = new Client(this.#config.client);
        ModuleManager.autoload();
        this.#client.login(this.#config.token);
        this.#initialized = true;
    }

    /**
     * Core instance getter
     * @returns {Core}
     */
    static getCore() {
        return core;
    }

    /**
     * Config getter
     * @returns {*}
     */
    getConfig() {
        return this.#config
    }

    /**
     *
     * @returns {Client}
     */
    getClient() {
        return this.#client;
    }

    /**
     * Destroy Discord client, unload all modules and exit
     */
    shutdown() {
        this.#client.destroy();
        ModuleManager.unloadAll();
    }

    /**
     *
     * @return {ModuleManager}
     */
    getModuleManager() {
        return ModuleManager;
    }

    /**
     *
     * @return {CommandManager}
     */
    getCommandManager() {
        return CommandManager;
    }

    /**
     *
     * @return {Logger}
     */
    getLogger() {
        return Logger;
    }

    /**
     * Register Discord Client event
     * @param {string} type
     * @param {function} handler
     * @param {boolean} once
     * @returns {*|string}
     */
    registerClientEvent(type, handler, once = false) {
        let uuid = uuidv4();
        this.#events[uuid] = {
            type: type,
            handler: handler
        }

        if (once) {
            this.#client.once(type, handler);
        } else {
            this.#client.on(type, handler);
        }

        return uuid;
    }

    /**
     * Unsubscribe Discord Client event
     * @param {string} uuid
     */
    unregisterClientEvent(uuid) {
        let event = this.#events[uuid] ?? null;
        if (!event) {
            throw new EventNotFoundError();
        }

        this.#client.off(event.type, event.handler);
    }
}