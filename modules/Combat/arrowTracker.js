import ModuleManager from '#moduleManager';
import { angleBetweenVectors, getNearestEntity, isInsideHitbox } from '#util/utils';
import Combat from './Combat.js';
import { Vec3 } from 'vec3';

export default class ArrowTracker {
  /** @type {Object<number, TrackedArrow>} */
  static #arrows = {};
  static #entityMovedEventId;
  static #entityGoneEventId;
  static #unload = false;

  /**
     *
     * @param {import('prismarine-entity').Entity} entity
     */
  static addArrow (entity) {
    if (this.#unload) {
      return;
    }

    const core = app();
    const bot = core.getClient();

    const record = new TrackedArrow(entity);

    this.#trackShooter(bot, record);
    this.#arrows[record.arrowEntity.id] = record;

    if (!this.#entityMovedEventId) {
      this.#entityMovedEventId = core.registerClientEvent('entityMoved', entity => {
        if (!this.#arrows[entity.id]) return;
        if (entity.position.equals(this.#arrows[entity.id].startPosition)) {
          return;
        }
        ArrowTracker.#trackVictim(entity);
      });
    }

    if (!this.#entityGoneEventId) {
      this.#entityGoneEventId = core.registerClientEvent('entityGone', entity => {
        if (!this.#arrows[entity.id]) return;
        if (entity.position.equals(this.#arrows[entity.id].startPosition)) {
          return;
        }
        ArrowTracker.#unloadArrow(entity);
      })
    }
  }

  /**
     *
     * @param {import('mineflayer').Bot} bot
     * @param {TrackedArrow} record
     */
  static #trackShooter (bot, record) {
    const arrowEntity = record.arrowEntity;
    const entities = Object.values(bot.entities).filter(entity => entity !== arrowEntity);

    record.shooter = getNearestEntity(entities, arrowEntity);
  }

  /**
     *
     * @param {import('prismarine-entity').Entity} arrowEntity
     */
  static #trackVictim (arrowEntity) {
    const record = this.#arrows[arrowEntity.id];

    if (record.ignore) {
      return;
    }

    this.#arrows[arrowEntity.id].ignore = true;
    const bot = app().getClient();
    const friendModule = ModuleManager.getModule('Friend');
    const combatModule = ModuleManager.getModule('Combat');

    const currentTimestamp = new Date().getTime();

    const direction = arrowEntity.position.clone().subtract(record.startPosition).normalize();
    const speed = arrowEntity.position.distanceTo(record.startPosition) / ((currentTimestamp - record.startTimestamp) / 1000);

    /**
         *  @param {import('prismarine-entity').Entity} entity
         *  @return {Vec3}
         */
    const getEndPosition = function (entity) {
      const time = record.startPosition.distanceTo(entity.position) / speed;
      return record.startPosition.clone().add(direction.clone().scale(speed * time));
    }

    /** @param {import('prismarine-entity').Entity} entity */
    const checkEntity = function (entity) {
      const endPosition = getEndPosition(entity);

      return isInsideHitbox(entity, endPosition);
    }

    if (friendModule) {
      friendModule.getFriendList().forEach(friendName => {
        const friendEntity = Object.values(bot.entities).find(value => value.displayName === friendName || value.username === friendName);
        if (!friendEntity) return;

        if (checkEntity(friendEntity)) {
          combatModule && combatModule.attack(record.shooter);
        }
      });
    }

    if (checkEntity(bot.entity)) {
      const newBlock = bot.findBlocks({
        maxDistance: 5,
        count: 10000,
        matching: block => (
          block.boundingBox === 'block' &&
          block.material !== 'lava' && block.material !== 'cactus' && block.material !== 'fire' && block.material !== 'portal' && block.material !== 'web' && block.material !== 'leaves' && block.material !== 'plant' && block.material !== 'water' && block.material !== 'vine' && block.material !== 'snow'
        )
      }).find(blockPos => {
        const newPosTemp = blockPos.clone().add(new Vec3(0, 1, 0));
        const oldDirection = getEndPosition(bot.entity).clone().subtract(record.startPosition);
        const newDirection = newPosTemp.clone().subtract(record.startPosition);

        oldDirection.y = 0;
        newDirection.y = 0;

        return (
          bot.blockAt(newPosTemp).type === 0 &&
          bot.blockAt(blockPos.clone().add(new Vec3(0, 2, 0))).type === 0 &&
          newPosTemp.distanceTo(bot.entity.position) > 2 &&
          angleBetweenVectors(oldDirection, newDirection) > 0.11

        )
      })?.clone()?.add(new Vec3(0, 1, 0));

      if (newBlock) {
        const oldDirection = getEndPosition(bot.entity).clone().subtract(record.startPosition);
        const newDirection = newBlock.clone().subtract(record.startPosition);

        oldDirection.y = 0;
        newDirection.y = 0;

        bot._client.write('position', {
          x: newBlock.x,
          y: newBlock.y,
          z: newBlock.z,
          onGround: true,
          pitch: bot.entity.pitch, // сохраняем старый угол поворота
          yaw: bot.entity.yaw // сохраняем старый угол поворота
        });
        // console.log('Moved from ', bot.entity.position, '->', newBlock);
        bot.entity.position = newBlock;
      }

      console.log('Sended attack');

      combatModule && combatModule.attack(record.shooter);
    }

    // console.log('Примерная траектория полета стрелы:', record.startPosition, '->', getEndPosition(bot.entity));
    // console.log('Позиция бота:', bot.entity.position);
  }

  static #unloadArrow (entity) {
  }

  static unload () {
    this.#unload = true;
    this.#arrows = {};
    const core = app();

    core.unregisterClientEvent(this.#entityMovedEventId);
    core.unregisterClientEvent(this.#entityGoneEventId);
  }

  /**
     *
     * @param {Entity[]} entities
     * @param {Entity} targetEntity
     * @return {Entity|undefined}
     */
  static #getNearestEntity (entities, targetEntity) {
    const distances = entities.map((entity) => targetEntity.position.distanceTo(entity.position));
    const minDistance = Math.min(...distances);

    return entities.find((entity) => targetEntity.position.distanceTo(entity.position) === minDistance);
  }
}

export class TrackedArrow {
  /** @type Entity */
  shooter;
  arrowEntity;
  /** @type {Vec3} */
  startPosition;
  startTimestamp;
  ignore = false;

  constructor (entity) {
    this.arrowEntity = entity;
    this.startPosition = entity.position.clone();
    this.startTimestamp = new Date().getTime();
  }
}
