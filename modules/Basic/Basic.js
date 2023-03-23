import AbstractModule from '#abstractModule';
import ModuleManager from '#moduleManager';
import Logger from '#util/log';

export default class Basic extends AbstractModule {
  #messageEventId;
  #chatEventId;
  #kickedEventId;
  load () {
    const core = app();

    /** @type {import('mineflayer').Bot} */
    const bot = core.getClient();

    /** @type {import('#system-module/cli').default} */
    const cli = ModuleManager.getModule('cli');

    cli.addCommand('chat', function (line) {
      bot.chat(line);
    }, function (trie, remove) {
      if (remove) {
        trie.remove('chat');
        return;
      }
      trie.insert('chat');
    })

    this.#messageEventId = core.registerClientEvent('message', (jsonMsg, position) => {
      Logger.info(`[MESSAGE] ${jsonMsg.toString()}`);
    });

    this.#chatEventId = core.registerClientEvent('chat', (username, message, translate, jsonMsg, matches) => {
      Logger.info(`[CHAT] ${username}: ${message}`);
    });

    this.#kickedEventId = core.registerClientEvent('kicked', reason => {
      Logger.warning(`Kicked by reason: ${reason}`);
    });
  }

  unload () {
    const core = app();

    /** @type {import('#system-module/cli').default} */
    const cli = ModuleManager.getModule('cli');

    cli.removeCommand('chat');

    core.unregisterClientEvent(this.#messageEventId);
    core.unregisterClientEvent(this.#chatEventId);
    core.unregisterClientEvent(this.#kickedEventId);
  }
}
