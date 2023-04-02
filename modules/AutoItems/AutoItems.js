import AbstractModule from '#abstractModule';
import { pathfinder } from 'mineflayer-pathfinder';
import armorManager from 'mineflayer-armor-manager';
import { plugin as autoeat } from 'mineflayer-auto-eat';

export default class extends AbstractModule {
  #playerCollectEventId;
  load () {
    const core = app();
    /** @type {import('mineflayer').Bot} */
    const bot = core.getClient();

    bot.loadPlugin(armorManager);
    bot.loadPlugin(pathfinder);
    bot.loadPlugin(autoeat);

    this.#playerCollectEventId = core.registerClientEvent('playerCollect', (collector, itemDrop) => {
      if (collector !== bot.entity) return

      const sword = bot.inventory.items().find(item => item.name.includes('sword'))
      if (sword) bot.equip(sword, 'hand');

      const shield = bot.inventory.items().find(item => item.name.includes('totem_of_undying'))
      if (shield) bot.equip(shield, 'off-hand')
    })

    bot.on('health', () => {
      if (bot.health <= 10) {
        bot.food = 0;
        bot.autoEat.eat().then(() => {}).catch(() => {});
      }
    })
  }

  unload () {
    app().unregisterClientEvent(this.#playerCollectEventId);
  }
}
