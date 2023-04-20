import { readdirSync } from 'fs';

/**
 *
 * @param source
 * @returns {string[]}
 */
export const getDirectories = source => readdirSync(source, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

/**
 *
 * @param {!array} searchElements
 * @param {!array} haystack
 * @return {boolean}
 */
export const arrayIncludesAll = function (searchElements, haystack) {
  if (searchElements.length > haystack.length) {
    return false;
  }

  let flag = true;
  for (const searchElement of searchElements) {
    if (!haystack.includes(searchElement)) {
      flag = false;
      break;
    }
  }

  return flag;
}

/**
 * @param {import('prismarine-entity').Entity} player
 * @param {import('vec3').Vec3} position
 */
export function isInsideHitbox (player, position) {
  const fixedPosition = position.clone();
  fixedPosition.x = Math.floor(fixedPosition.x);
  fixedPosition.y = Math.floor(fixedPosition.y);
  fixedPosition.z = Math.floor(fixedPosition.z);

  const width = player.width;
  const height = player.height;
  const halfHeight = height;
  const playerPos = player.position.clone();
  const boundingBox = {
    minX: Math.floor(playerPos.x - (width * 2)) - 1.5,
    minY: Math.floor(playerPos.y - halfHeight),
    minZ: Math.floor(playerPos.z - (width * 2)) - 1.5,
    maxX: Math.floor(playerPos.x + (width * 2)) + 1.5,
    maxY: Math.floor(playerPos.y + (height + halfHeight)),
    maxZ: Math.floor(playerPos.z + (width * 2)) + 1.5
  };

  // console.log(fixedPosition.x >= boundingBox.minX, fixedPosition.x, '>=', boundingBox.minX);
  // console.log(fixedPosition.x <= boundingBox.maxX, fixedPosition.x, '<=', boundingBox.maxX);
  // console.log(fixedPosition.y >= boundingBox.minY, fixedPosition.y, '>=', boundingBox.minY);
  // console.log(fixedPosition.y <= boundingBox.maxY, fixedPosition.y, '<=', boundingBox.maxY);
  // console.log(fixedPosition.z >= boundingBox.minZ, fixedPosition.z, '>=', boundingBox.minZ);
  // console.log(fixedPosition.z <= boundingBox.maxZ, fixedPosition.z, '<=', boundingBox.maxZ);

  return fixedPosition.x >= boundingBox.minX && fixedPosition.x <= boundingBox.maxX &&
      fixedPosition.y >= boundingBox.minY && fixedPosition.y <= boundingBox.maxY &&
      fixedPosition.z >= boundingBox.minZ && fixedPosition.z <= boundingBox.maxZ;
}

/**
 *
 * @param {import('vec3').Vec3} vector1
 * @param {import('vec3').Vec3} vector2
 * @return {number}
 */
export function angleBetweenVectors (vector1, vector2) {
  const dotProduct = vector1.dot(vector2);
  const length1 = vector1.norm();
  const length2 = vector2.norm();
  const cosTheta = dotProduct / (length1 * length2);
  return Math.acos(cosTheta);
}

export function getNearestEntity (entities, targetEntity) {
  const distances = entities.map((entity) => targetEntity.position.distanceTo(entity.position));
  const minDistance = Math.min(...distances);

  return entities.find((entity) => targetEntity.position.distanceTo(entity.position) === minDistance);
}

export function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
