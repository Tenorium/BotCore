import AbstractModule from '#abstractModule';
import { pathfinder } from 'mineflayer-pathfinder';
import { plugin as pvp } from 'mineflayer-pvp';
import ModuleManager from '#moduleManager';
import bloodhound from 'mineflayer-bloodhound';
import Logger from '#util/log';
import mineflayer from 'mineflayer';
import ArrowTracker from './arrowTracker.js';
import TargetManager from './targetManager.js';
import hawkEyePlugin from 'minecrafthawkeye';

const bloodHoundPlugin = bloodhound(mineflayer);

const calculateDirection = function (pitch, yaw) {
  const pitchRadians = pitch * Math.PI / 180;
  const yawRadians = yaw * Math.PI / 180;
  const xzLength = Math.cos(pitchRadians);
  const x = xzLength * Math.sin(yawRadians);
  const y = -Math.sin(pitchRadians);
  const z = xzLength * Math.cos(yawRadians);
  return new Vec3(x, y, z);
}

export default class Combat extends AbstractModule {
  #combatEventListener;
  #correlateAttackEventId;
  #startedAttackingEventId;
  load () {
    const core = app();

    /** @type {import('mineflayer').Bot} */
    const bot = core.getClient();

    /** @type {import('#system-module/cli').default} */
    const cli = ModuleManager.getModule('cli');

    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);
    bot.loadPlugin(bloodHoundPlugin)
    bot.loadPlugin(hawkEyePlugin.default);

    bot.bloodhound.yaw_correlation_enabled = true;

    this.#combatEventListener = (packet) => {
      let attacker;
      if (packet.event === 1 && (attacker = bot.entities[packet.entityId])) {
        const notificationText = `Бота атаковал ${attacker.type === 'player' ? `игрок **${attacker.username}**` : attacker.displayName}`;

        Logger.info(notificationText);
        ModuleManager.getModule('DiscordNotify').send(notificationText, 'ffff00');
        ModuleManager.getModule('Combat').attack(bot.entities[packet.entityId])
      }
    };
    bot._client.on('combat_event', this.#combatEventListener);

    bot.on('entitySpawn', (arrowEntity) => {
      if (arrowEntity.objectType === 'Shot arrow') {
        ArrowTracker.addArrow(arrowEntity);
      }
    });

    bot.on('tick', () => {
      this.attack(bot.nearestEntity(entity => (
        entity.kind === 'Hostile mobs' && bot.entity.position.distanceTo(entity.position) < 10
      )));

      const nextTarget = TargetManager.getNextTarget();
      const hasArrows = function () {
        const arrows = bot.inventory.items().filter(item => item.name === 'arrow');
        return arrows.length > 0;
      }

      if (!nextTarget) {
        return;
      }

      if (
        nextTarget.position.distanceTo(bot.entity.position) > 10 &&
        hasArrows()
      ) {
        bot.hawkEye.oneShot(nextTarget, 'bow');
        return;
      }

      bot.pvp.attack(nextTarget);
    });

    bot.on('entityDead', entity => {
      TargetManager.removeTarget(entity);
    })

    this.#correlateAttackEventId = core.registerClientEvent('onCorrelateAttack', function (attacker, victim, weapon) {
      const combat = ModuleManager.getModule('Combat');
      const webhook = ModuleManager.getModule('DiscordNotify');

      if (!bot.loggedIn) {
        return;
      }

      if (victim === bot.entity) {
        const notificationText = `Бота атаковал ${attacker.type === 'player' ? `игрок **${attacker.username}**` : attacker.displayName}`;

        Logger.info(notificationText);
        webhook.send(notificationText, 'ffff00');

        combat.attack(attacker);
        return;
      }

      if (combat.checkFriend(victim) && !combat.checkFriend(attacker)) {
        const notificationText = `Друга ${victim.player.username} атаковал ${attacker.type === 'player' ? `игрок **${attacker.player.username}**` : attacker.displayName}`;

        Logger.info(notificationText);
        webhook.send(notificationText, 'ffff00');

        combat.attack(attacker);
      }
    });

    this.#startedAttackingEventId = core.registerClientEvent('startedAttacking', function () {
      ModuleManager.getModule('DiscordNotify').send(`Начинает атаковать ${bot.pvp.target.username ?? bot.pvp.target.name}`, '00ff00');
    });

    if (cli) {
      cli.addCommand('attack', function (line) {
        if (!bot.players[line]) {
          console.log('I can\'t see player');
          return;
        }

        bot.pvp.attackRange = 6;

        bot.pvp.attack(bot.players[line].entity);
      },
      function (trie, remove) {
        if (remove) {
          trie.remove('attack');
          return;
        }
        trie.insert('attack');
      });

      cli.addCommand('stopattack', function () {
        bot.pvp.stop();
      },
      function (trie, remove) {
        if (remove) {
          trie.remove('stopattack');
          return;
        }
        trie.insert('stopattack')
      });
    }
  }

  unload () {
    const core = app();

    core.unregisterClientEvent(this.#startedAttackingEventId);
    core.unregisterClientEvent(this.#correlateAttackEventId);
    core.getClient()._client.off('combat_event', this.#combatEventListener);

    const cli = ModuleManager.getModule('cli');
    if (cli) {
      cli.removeCommand('attack');
      cli.removeCommand('stopattack');
    }
  }

  checkFriend (entity) {
    if (!entity || entity.type !== 'player') {
      return false;
    }

    const friendModule = ModuleManager.getModule('Friend');

    if (!friendModule) {
      return false;
    }

    return friendModule.getFriendList().includes(entity.username);
  }

  attack (entity) {
    if (!entity) {
      return;
    }

    if (!this.checkFriend()) {
      TargetManager.addTarget(entity);
    }
  }
}
