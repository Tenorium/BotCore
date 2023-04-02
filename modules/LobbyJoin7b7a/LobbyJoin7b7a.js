import AbstractModule from '#abstractModule';
import { Movements, pathfinder } from 'mineflayer-pathfinder';
import mcbotdata from 'minecraft-data';
import ModuleManager from '#moduleManager';

const GoalNear = (await import('mineflayer-pathfinder')).default.goals.GoalNear;

export default class LobbyJoin7b7a extends AbstractModule {
  #tickEventId;

  load () {
    const core = app();
    const bot = core.getClient();

    if (bot._client.socket.remoteAddress === '65.21.70.46') {
      bot.loggedIn = false;

      this.#tickEventId = core.registerClientEvent('tick', () => {
        const bot = app().getClient();
        const module = ModuleManager.getModule('LobbyJoin7b7a');

        if (bot.loggedIn) {
          return;
        }

        bot.loadPlugin(pathfinder);

        for (const entityKey of Object.keys(bot.entities)) {
          const entity = bot.entities[entityKey];

          if (entity.username === '§3Анархия') {
            const botData = mcbotdata(bot.version);
            const defaultMove = new Movements(bot, botData);
            const goal = new GoalNear(entity.position.x, entity.position.y, entity.position.z, 1)

            bot.pathfinder.setMovements(defaultMove);
            bot.pathfinder.setGoal(goal);

            bot.once('goal_reached', targetGoal => {
              if (targetGoal === goal) {
                bot.activateEntity(entity);
                bot.loggedIn = true;
                ModuleManager.getModule('DiscordNotify').send('Заходит на сервер', '00ff00');
              }
            });
          }
        }
      })
    }
  }

  unload () {
    this.#tickEventId && app().unregisterClientEvent(this.#tickEventId);
  }
}
