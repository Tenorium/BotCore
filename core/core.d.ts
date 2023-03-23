import {BotEvents, Bot} from "mineflayer";

export default class Core {
    /**
       * Core instance getter
       * @returns {Core}
       */
    static getCore(): Core;
    /**
       *
       * @param config
       * @return {Core}
       */
    constructor(config: any);
    /**
       * Core initialization function
       */
    init(): void;
    /**
       * Config getter
       * @returns {*}
       */
    getConfig(): any;

    getClient(): Bot;
    /**
       * Destroy Discord client, unload all modules and exit
       */
    shutdown(): void;
    /**
       * Register Discord Client event
       * @param {string} type
       * @param {function} handler
       * @param {boolean} once
       * @returns {*|string}
       */
    registerClientEvent<E extends keyof BotEvents>(type: E, handler: Function, once?: boolean): any | string;
    /**
       * Unsubscribe Discord Client event
       * @param {string} uuid
       */
    unregisterClientEvent(uuid: string): void;
}
//# sourceMappingURL=core.d.ts.map
