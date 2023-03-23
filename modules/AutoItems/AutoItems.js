import AbstractModule from '#abstractModule';
import { pathfinder } from 'mineflayer-pathfinder';
import armorManager from 'mineflayer-armor-manager'

export default class extends AbstractModule {
  #playerCollectEventId;
  load () {
    const core = app();
    /** @type {import('mineflayer').Bot} */
    const bot = core.getClient();

    bot.loadPlugin(armorManager);
    bot.loadPlugin(pathfinder);

    this.#playerCollectEventId = core.registerClientEvent('playerCollect', (collector, itemDrop) => {
      if (collector !== bot.entity) return

      setTimeout(() => {
        const sword = bot.inventory.items().find(item => item.name.includes('sword'))
        if (sword) bot.equip(sword, 'hand')
      }, 150)

      setTimeout(() => {
        const shield = bot.inventory.items().find(item => item.name.includes('shield'))
        if (shield) bot.equip(shield, 'off-hand')
      }, 250)
    })
  }

  unload () {
    app().unregisterClientEvent(this.#playerCollectEventId);
  }
}
