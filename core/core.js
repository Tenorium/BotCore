import ModuleManager from '#moduleManager';
import { v4 as uuidv4 } from 'uuid';
import Logger from '#util/log';
import CoreAlreadyInitializedError from './error/CoreAlreadyInitializedError.js';
import EventNotFoundError from './error/EventNotFoundError.js';
import wtfnode from 'wtfnode';
import mineflayer from 'mineflayer';
import AutoAuth from 'mineflayer-auto-auth';

let core;

export default class Core {
  #events = {};
  #config;

  /** @type {mineflayer.Bot} **/
  #client;

  #initialized = false;
  #shutdown = false;

  /**
   *
   * @param config
   * @return {Core}
   */
  constructor (config) {
    if (core) {
      return core;
    }

    this.#config = config;
    Logger.setConfig(this.#config.logger);
    core = this;

    /**
     * @param {string|undefined} name
     * @return {Core|*}
     */
    global.app = function (name = undefined) {
      if (name === undefined) {
        return Core.getCore();
      }
    };
  }

  /**
   * Core instance getter
   * @returns {Core}
   */
  static getCore () {
    return core;
  }

  /**
   * Core initialization function
   */
  init () {
    if (this.#initialized) {
      throw new CoreAlreadyInitializedError();
    }

    Logger.debug('Core init started!');

    this.#client = mineflayer.createBot({
      auth: 'offline',
      version: this.#config.client.version,
      host: this.#config.client.host,
      port: this.#config.client.port,
      username: this.#config.client.username,
      plugins: [AutoAuth],
      AutoAuth: this.#config.client.password,
      viewDistance: 'far'
    });

    this.getClient().on('end', (reason) => {
      if (this.#shutdown) {
        return;
      }

      Logger.info('Bot disconnected, reloading all modules...');
      ModuleManager.unloadAll();

      this.#client = mineflayer.createBot({
        auth: 'offline',
        version: this.#config.client.version,
        host: this.#config.client.host,
        port: this.#config.client.port,
        username: this.#config.client.username,
        plugins: [AutoAuth],
        AutoAuth: this.#config.client.password,
        viewDistance: 'far'
      });

      ModuleManager.autoload();
    });

    ModuleManager.autoload();
    this.#initialized = true;
  }

  /**
   * Config getter
   * @returns {*}
   */
  getConfig () {
    return this.#config;
  }

  /**
   *
   * @returns {mineflayer.Bot}
   */
  getClient () {
    return this.#client;
  }

  /**
   * Destroy Discord client, unload all modules and exit
   */
  shutdown () {
    this.#shutdown = true;
    this.#client.end('shutdown');

    wtfnode.init();

    ModuleManager.unloadAll();
  }

  /**
   * Register Discord Client event
   */
  registerClientEvent (type, handler, once = false) {
    const uuid = uuidv4();

    const wrapper = function (...args) {
      try {
        return handler(...args);
      } catch (e) {
        Logger.error('Error in client event', e);
      }
    };

    this.#events[uuid] = {
      type,
      handler: wrapper
    };

    if (once) {
      this.#client.once(type, wrapper);
    } else {
      this.#client.on(type, wrapper);
    }

    return uuid;
  }

  /**
   * Unsubscribe Discord Client event
   * @param {string} uuid
   */
  unregisterClientEvent (uuid) {
    const event = this.#events[uuid] ?? null;
    if (!event) {
      throw new EventNotFoundError();
    }

    this.#client.off(event.type, event.handler);
  }
}
