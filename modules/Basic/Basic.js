import AbstractModule from '#abstractModule';
import ModuleManager from '#moduleManager';
import Logger from '#util/log';

export default class Basic extends AbstractModule {
  load () {
    /** @type {import('mineflayer').Bot} */
    const bot = app().getClient();

    /** @type {import('#system-module/cli').default} */
    const cli = ModuleManager.getModule('cli');

    cli.addCommand('chat', function (line) {
      bot.chat(line);
    }, function (trie) {
      trie.insert('chat');
    })

    bot.on('message', (jsonMsg, position) => {
      Logger.info(`[MESSAGE] ${jsonMsg.toString()}`);
    })

    bot.on('chat', (username, message, translate, jsonMsg, matches) => {
      Logger.info(`[CHAT] ${username}: ${message}`);
    })
    bot.on('kicked', reason => {
      Logger.warning(`Kicked by reason: ${reason}`);
    });
  }
}
