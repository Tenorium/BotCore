import { Client } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'utilslib';
import wtfnode from 'wtfnode';
const ModuleManager = app('ModuleManager');
export default class Core {
    #events = {};
    #config;
    #client;
    constructor(config) {
        if (app('ServiceLocator').has('Core')) {
            return app('ServiceLocator').get('Core');
        }
        this.#config = config;
        Logger.setConfig(this.#config?.getLoggerConfig());
        this.init();
    }
    /**
       * Core initialization function
       */
    init() {
        Logger.debug('Core init started!');
        try {
            this.#client = new Client(this.#config?.getClientConfig().getData());
        }
        catch (e) {
            // @ts-expect-error
            Logger.error('Unexpected error in Client', e);
        }
        void ModuleManager.autoload().then(() => {
            if (this.#client === undefined) {
                Logger.fatal('Client is undefined');
                throw new Error('Client is undefined');
            }
            if (this.#config === undefined) {
                Logger.fatal('Config is undefined');
                throw new Error('Config is undefined');
            }
            void this.#client.login(this.#config.getToken()).catch(reason => {
                Logger.error('Unexpected error in Client', reason);
            });
        }).catch((reason) => {
            Logger.error('Unexpected error in ModuleManager at autoload', reason);
        });
    }
    /**
       * Config getter
       * @returns {*}
       */
    getConfig() {
        return this.#config;
    }
    getClient() {
        if (this.#client === undefined) {
            Logger.fatal('Client is undefined');
            throw new Error('Client is undefined');
        }
        return this.#client;
    }
    /**
       * Destroy Discord client, unload all modules and exit
       */
    shutdown() {
        if (this.#client === undefined) {
            Logger.fatal('Client is undefined');
            throw new Error('Client is undefined');
        }
        this.#client.destroy();
        wtfnode.init();
        try {
            ModuleManager.unloadAll();
        }
        catch (e) {
            // @ts-expect-error
            Logger.error('Error in ModuleManager at unloadAll', e);
        }
    }
    /**
       * Register Discord Client event
       * @param {string} name
       * @param {function} handler
       * @param {boolean} once
       * @returns {*|string}
       */
    registerClientEvent(name, handler, once = false) {
        if (this.#client === undefined) {
            Logger.fatal('Client is undefined');
            throw new Error('Client is undefined');
        }
        const uuid = uuidv4();
        const wrapper = function (...args) {
            try {
                return handler(...args);
            }
            catch (e) {
                // @ts-expect-error
                Logger.error('Error in client event', e);
            }
        };
        this.#events[uuid] = {
            name,
            handler: wrapper
        };
        if (once) {
            this.#client.once(name, wrapper);
        }
        else {
            this.#client.on(name, wrapper);
        }
        return uuid;
    }
    /**
       * Unsubscribe Discord Client event
       * @param {string} uuid
       */
    unregisterClientEvent(uuid) {
        const event = this.#events[uuid] ?? null;
        if (event === null) {
            throw new Error('Event not found');
        }
        if (this.#client === undefined) {
            Logger.fatal('Client is undefined');
            throw new Error('Client is undefined');
        }
        this.#client.off(event.name, event.handler);
    }
}
