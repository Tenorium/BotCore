import { Awaitable, Client, ClientEvents } from 'discord.js';
import { CoreConfig } from '../init.d/init.config.js';
export default class Core {
    #private;
    constructor(config: CoreConfig);
    /**
       * Core initialization function
       */
    private init;
    /**
       * Config getter
       * @returns {*}
       */
    getConfig(): CoreConfig | undefined;
    getClient(): Client;
    /**
       * Destroy Discord client, unload all modules and exit
       */
    shutdown(): void;
    /**
       * Register Discord Client event
       * @param {string} name
       * @param {function} handler
       * @param {boolean} once
       * @returns {*|string}
       */
    registerClientEvent<T extends keyof ClientEvents = keyof ClientEvents>(name: T, handler: (...args: ClientEvents[T]) => Awaitable<void>, once?: boolean): string;
    /**
       * Unsubscribe Discord Client event
       * @param {string} uuid
       */
    unregisterClientEvent(uuid: string): void;
}
