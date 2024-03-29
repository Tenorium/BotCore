import ModuleManager from '#moduleManager';
import { Client } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import Logger from '#util/log';
import CoreAlreadyInitializedError from './error/CoreAlreadyInitializedError.js';
import EventNotFoundError from './error/EventNotFoundError.js';
import wtfnode from 'wtfnode';

let core;

export default class Core {
  #events = {};
  #config;

  /** @type {import('discord.js').Client} **/
  #client;

  #initialized = false;

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
    }
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

    this.#client = new Client(this.#config.client);
    ModuleManager.autoload();
    this.#client.login(this.#config.token);
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
     * @returns {Client}
     */
  getClient () {
    return this.#client;
  }

  /**
     * Destroy Discord client, unload all modules and exit
     */
  shutdown () {
    this.#client.destroy();

    wtfnode.init();

    ModuleManager.unloadAll();
  }

  /**
     * Register Discord Client event
     * @param {string} type
     * @param {function} handler
     * @param {boolean} once
     * @returns {*|string}
     */
  registerClientEvent (type, handler, once = false) {
    const uuid = uuidv4();

    const wrapper = function (...args) {
      try {
        return handler(...args);
      } catch (e) {
        Logger.error('Error in client event', e);
      }
    }

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
