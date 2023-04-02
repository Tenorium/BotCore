import { getNearestEntity } from '#util/utils';
import mcbotdata from 'minecraft-data';
import mineflayer from 'mineflayer';

export default class TargetManager {
  /**
   * @type {Entity[]}
   */
  static #targets = [];

  /**
     *
     * @param {Entity} entity
     */
  static addTarget (entity) {
    this.#targets.push(entity);
  }

  static forceTarget (entity) {
    if (!this.#targets.includes(entity)) {
      this.#targets.push(entity);
    }

    this.#targets.sort((a, b) => a.id === entity.id ? -1 : b.id === entity.id ? 1 : 0);
  }

  static getNextTarget () {
    this.refreshTargets();
    return this.#targets.pop();
  }

  static removeTarget (entity) {
    let index;
    if ((index = this.#targets.indexOf(entity)) !== -1) {
      delete this.#targets[index];
    }
  }

  static refreshTargets () {
    const bot = app().getClient();
    const botEntity = bot.entity;
    const mcdata = mcbotdata(bot.version);

    const totemOfUndyingId = mcdata.itemsByName.totem_of_undying.id;
    this.#targets = this.#targets.filter(value => value?.isValid);

    this.#targets.sort((a, b) => {
      let result = 0;

      const nearestEntity = getNearestEntity([a, b], botEntity);

      if (nearestEntity.id === a.id) {
        result -= 30;
      } else {
        result += 30;
      }

      if (a.type === 'player') {
        result -= 5;
      } else if (b.type === 'player') {
        result += 5;
      }

      if (
        a.type === 'player' &&
          (
            (a.heldItem && a.heldItem.type === totemOfUndyingId) ||
            (a.equipment[1] && a.equipment[1].type === totemOfUndyingId)
          )
      ) {
        result -= 20;
      } else if (
        b.type === 'player' &&
          (
            (b.heldItem && b.heldItem.type === totemOfUndyingId) ||
            (b.equipment[1] && b.equipment[1].type === totemOfUndyingId)
          )
      ) {
        result += 20;
      }

      if (a.heldItem && a.heldItem.name === 'bow') {
        result -= 10;
      } else if (b.heldItem && b.heldItem.name === 'bow') {
        result += 10
      }

      return result;
    })
  }
}
