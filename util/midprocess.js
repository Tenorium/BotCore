import { spawn } from 'child_process';
import ConfigManager from '#configManager';
import EventEmitter from 'events';
import { sleep } from '#util/utils';

export class ClientManager {
  static #clients = {};
  static #prefix = 'skynet_';
  static #number = 2;

  static async startClient () {
    const name = this.#prefix + this.#number;
    await sleep(4000);
    const clientConfig = ConfigManager.getConfigObject();

    if (!clientConfig.core.moduleManager.disabledModules.includes('cli')) {
      clientConfig.core.moduleManager.disabledModules.push('cli')
    }

    const client = spawn(process.argv[0], [process.argv[1], '--worker', '--username', `"${name}"`, '--config', `"${JSON.stringify(clientConfig)}"`]);
    this.#number++;
    client.stdout.on('data', data => {
      const messages = data.toString().split('\n').filter(Boolean);
      for (const message of messages) {
        try {
          this.#handleMessageFromClient(JSON.parse(message));
        } catch (e) {
          this.#handleMessageFromClient(new Message('raw', { message }, { name }));
        }
      }
    })

    client.stderr.on('data', data => {
      console.log(`STDERR: ${data.toString()}`);
    });

    this.#clients[name] = client;
  }

  static getClients () {
    return this.#clients;
  }

  /**
   *
   * @param {Message} message
   */
  static sendMessage (message) {
    Object.keys(this.#clients).forEach(name => {
      const client = this.#clients[name];
      client.stdin.write(JSON.stringify(message) + '\n');
    });
    // process.stdout.write(JSON.stringify(message) + '\n');
  }

  static #handleMessageFromClient (message) {
    switch (message.type) {
      case 'log':
        this.#handleLog(message);
        break;
      case 'raw':
        console.log(`${message.headers.name}: [RAW] ${message.data.message}`);
    }
  }

  static #handleLog (message) {
    const id = message.headers.name;
    const { date, level, message: logMessage } = message.data;
    console.log(`${id}: [${date}] [${level.toUpperCase()}] ${logMessage}`);
  }
}

export class Client {
  static #em;
  static init () {
    process.stdin.on('data', (data) => {
      const messages = data.toString().split('\n').filter(Boolean);
      for (const message of messages) {
        this.#handleMessageFromServer(JSON.parse(message));
      }
    })
  }

  /**
   *
   * @param {Message} message
   */
  static sendMessage (message) {
    process.stdout.write(JSON.stringify(message) + '\n');
  }

  static #handleMessageFromServer (message) {
    this.getEventEmitter().emit(message.type, message);
  }

  static getEventEmitter () {
    if (!this.#em) {
      this.#em = new class extends EventEmitter {}();
    }

    return this.#em;
  }
}

export class Message {
  constructor (type, data, headers) {
    this.type = type;
    this.data = data;
    this.headers = headers;
  }

  toJSON () {
    return {
      type: this.type,
      data: this.data,
      headers: this.headers
    }
  }
}
