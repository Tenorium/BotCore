import {arrayIncludesAll} from "./utils.js";
import {install} from "./npm-util.js";
import Logger from "./log.js";

const defaultDependencies = {
    'auto-git-update': '1.1.1',
    'colors': '1.4.0',
    'discord.js': '13.6.0',
    'uuid': '8.3.2',
    'moment': '2.29.3',
    'splitargs': '0.0.7',
    'i18n': '0.15.1',
    'semver': '7.3.8',
    'adm-zip': '0.5.9',
    'axios': '1.1.3',
    'progress': '2.0.3',
    'sha256-file': '1.0.0',
}

const dependencyCache = {};

const addDependency = function (name, version) {
    if (Object.hasOwn(dependencyCache, name)) {
        Logger.warning(`[DependencyResolver] Updating package "${name}" from ${dependencyCache[name]} to ${version}`);
    }

    dependencyCache[name] = version;
    Logger.debug(`[DependencyResolver] Added dependency "${name}"="${version}"`);
}

const removeDependency = function (name) {
    if (!Object.hasOwn(dependencyCache, name)) {
        return;
    }

    delete dependencyCache[name];
    Logger.debug(`[DependencyResolver] Remove dependency "${name}"`);
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

    Logger.info('[DependecyResolver] Adding dependencies...');

    Object.keys(depObject).forEach(name => {
        addDependency(name, depObject[name]);
    });

    Logger.info('[DependencyResolver] Installing dependencies...');

    await installDependencies();
    Logger.info('[DependencyResolver] Dependencies installed.');
}