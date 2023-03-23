import AbstractModule from '#abstractModule';
import { Movements, pathfinder } from 'mineflayer-pathfinder';
import mcbotdata from 'minecraft-data';
import ModuleManager from '#moduleManager';

const GoalNear = (await import('mineflayer-pathfinder')).default.goals.GoalNear;

export default class LobbyJoin7b7a extends AbstractModule {
  #tickTimerId;

  load () {
    const core = app();
    const bot = core.getClient();

    this.#tickTimerId = setInterval(function (bot, this_) {
      bot.loadPlugin(pathfinder);

      for (const entityKey of Object.keys(bot.entities)) {
        const entity = bot.entities[entityKey];

        if (entity.username === '§3Анархия') {
          clearInterval(this_.#tickTimerId);
          this_.#tickTimerId = undefined;

          const botData = mcbotdata(bot.version);
          const defaultMove = new Movements(bot, botData);
          const goal = new GoalNear(entity.position.x, entity.position.y, entity.position.z, 1)

          bot.pathfinder.setMovements(defaultMove);
          bot.pathfinder.setGoal(goal);

          bot.once('goal_reached', targetGoal => {
            if (targetGoal === goal) {
              bot.activateEntity(entity);

              ModuleManager.getModule('DiscordNotify').send('Заходит на сервер', '00ff00');
            }
          });
        }
      }
    }, 50, bot, this)
  }

  unload () {
    if (this.#tickTimerId === undefined) {
      return;
    }

    clearInterval(this.#tickTimerId);
  }
}
