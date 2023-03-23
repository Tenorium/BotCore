import { arrayIncludesAll } from './utils.js';
import { install, listInstalled } from './npm-util.js';
import Logger from './log.js';
import semver from 'semver/preload.js';

const logsPrefix = '[DependencyResolver]';

const defaultDependencies = {
  'adm-zip': '0.5.9',
  axios: '1.1.3',
  colors: '1.4.0',
  'comment-parser': '1.3.1',
  i18n: '0.15.1',
  mineflayer: '4.8.1',
  moment: '2.29.4',
  progress: '2.0.3',
  'readline-trie-completer': '0.0.0',
  semver: '7.3.8',
  'sha256-file': '1.0.0',
  'simple-git': '3.14.1',
  splitargs: '0.0.7',
  uuid: '8.3.2',
  wtfnode: '0.9.1',
  yargs: '17.7.1'
};

const dependencyCache = await listInstalled();

/**
 *
 * @param name
 * @param version
 * @return {boolean}
 */
const addDependency = function (name, version) {
  if (
    Object.hasOwn(dependencyCache, name)
  ) {
    if (semver.gt(version, dependencyCache[name])) {
      Logger.warning(`${logsPrefix} Updating package "${name}" from ${dependencyCache[name]} to ${version}`);
      dependencyCache[name] = version;
      return true;
    }

    return false;
  }

  dependencyCache[name] = version;
  Logger.debug(`${logsPrefix} Added dependency "${name}"="${version}"`);

  return true;
}

const removeDependency = function (name) {
  if (!Object.hasOwn(dependencyCache, name)) {
    return;
  }

  delete dependencyCache[name];
  Logger.debug(`${logsPrefix} Remove dependency "${name}"`);
}

const installDependencies = async function () {
  if (!arrayIncludesAll(Object.keys(defaultDependencies), Object.keys(dependencyCache))) {
    Object.assign(dependencyCache, defaultDependencies);
  }

  await install(dependencyCache);
}

/**
 * @param {Object<string,string>} depObject
 */
export default async function (depObject) {
  if (Object.keys(depObject).length === 0) {
    return true;
  }

  Logger.info(`${logsPrefix} Adding dependencies...`);

  let skip = true;

  Object.keys(depObject).forEach(name => {
    if (addDependency(name, depObject[name])) {
      skip = false;
    }
  })

  if (skip) {
    Logger.info(`${logsPrefix} Dependencies already installed.Skipped.`);
    return;
  }

  Logger.info(`${logsPrefix} Installing dependencies...`);

  await installDependencies();
  Logger.info(`${logsPrefix} Dependencies installed.`);
}
