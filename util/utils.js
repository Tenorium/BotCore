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
