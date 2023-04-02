import AbstractModule from '#abstractModule';
import ModuleManager from '#moduleManager';

export default class LocalDetect extends AbstractModule {
  #players = [];
  #tickEventId;
  load () {
    this.#tickEventId = app().registerClientEvent('tick', () => {
      const bot = app().getClient();
      const module = ModuleManager.getModule('LocalDetect');
      const players = app().getClient().players;

      Object.keys(players).forEach(name => {
        if (name === bot.username || players[name].entity === undefined) {
          delete players[name];
        }
      })

      const playerNames = Object.keys(players);

      if (!bot.loggedIn) {
        return;
      }

      /**
           * @param {Item[]} items
           */
      const formatEquipment = function (items) {
        return items.map(item => {
          if (item === null) {
            return null;
          }
          const enchantmentString = item.enchants.map(enchantment => {
            return `${enchantment.name} ${enchantment.level ? `- ${enchantment.level}` : undefined}`;
          }).join(', ');

          return `${item.name}${item.enchants.length > 0 ? `(${enchantmentString})` : undefined}`;
        }).join('\n');
      };

      playerNames.forEach(name => {
        if (!module.#players.includes(name)) {
          const entity = players[name].entity;

          module.#players.push(name);

          ModuleManager.getModule('DiscordNotify').send(`Увидел игрока **${name}}**\n` +
                      `Координаты: ${entity.position.x} ${entity.position.y} ${entity.position.z})\n` +
                      `Здоровье: ${entity.health}\n` +
                      '**СНАРЯЖЕНИЕ**\n' +
                      formatEquipment(entity.equipment) ?? 'Не обнаружено', 'ffff00');
        }
      });

      module.#players.forEach(name => {
        if (!playerNames.includes(name)) {
          delete module.#players[name];
        }
      })
    })
  }

  unload () {
    app().unregisterClientEvent(this.#tickEventId);
  }
}
