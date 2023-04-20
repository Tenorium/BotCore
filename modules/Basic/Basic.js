import AbstractModule from '#abstractModule';
import ModuleManager from '#moduleManager';
import Logger from '#util/log';
import { Client } from '#util/midprocess';

export default class Basic extends AbstractModule {
  #messageEventId;
  #kickedEventId;
  #errorEventId;
  #tickTimer;
  load () {
    const core = app();

    if (args.worker) {
      Client.init();
      Client.getEventEmitter().on('shutdown', args => {
        core.shutdown();
      })
    }

    /** @type {import('mineflayer').Bot} */
    const bot = core.getClient();

    /** @type {import('#system-module/cli').default} */
    const cli = ModuleManager.getModule('cli');

    this.#tickTimer = setInterval(() => {
      app().getClient().emit('tick');
    }, 50);

    if (cli) {
      cli.addCommand('chat', function (line) {
        bot.chat(line);
      }, function (trie, remove) {
        if (remove) {
          trie.remove('chat');
          return;
        }
        trie.insert('chat');
      })
    }

    this.#messageEventId = core.registerClientEvent('message', (jsonMsg) => {
      Logger.info(`[MESSAGE] ${jsonMsg.toString()}`);
    });

    this.#kickedEventId = core.registerClientEvent('kicked', reason => {
      Logger.warning(`Kicked by reason: ${reason}`);
    });
    this.#errorEventId = core.registerClientEvent('error', error => {
      Logger.error('Error', error);
    })
  }

  unload () {
    const core = app();

    /** @type {import('#system-module/cli').default} */
    const cli = ModuleManager.getModule('cli');

    if (cli) {
      cli.removeCommand('chat');
    }

    core.unregisterClientEvent(this.#messageEventId);
    core.unregisterClientEvent(this.#kickedEventId);

    clearInterval(this.#tickTimer);
  }
}