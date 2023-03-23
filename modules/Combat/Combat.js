import AbstractModule from '#abstractModule';
import { pathfinder } from 'mineflayer-pathfinder';
import { plugin as pvp } from 'mineflayer-pvp';

export default class Combat extends AbstractModule {
  load () {
    /** @type {import('mineflayer').Bot} */
    const bot = app().getClient();

    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);

    bot.on('entityHurt', entity => {
      if (entity === bot.entity) {
        const attacker = bot.nearestEntity(nearestEntity => nearestEntity.kind === 'Hostile mobs' || nearestEntity.type === 'player');
        bot.pvp.attack(attacker);
      }
    });

    cli.addCommand('attack', function (line) {
      if (!bot.players[line]) {
        console.log('I can\'t see player');
        return;
      }

      bot.pvp.attackRange = 6;

      bot.pvp.attack(bot.players[line].entity);
    },
    function (trie) {
      trie.insert('attack');
      Object.keys(bot.players).forEach(value => {
        trie.insert(`attack ${value}`);
      })
    });

    cli.addCommand('stop', function (line) {
      bot.pvp.stop();
    },
    function (trie) {
      trie.insert('stop')
    });
  }

  unload () {

  }
}
