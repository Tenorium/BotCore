import Core from "./core/core.js";
import colors from "colors";
import i18n from "i18n";
import {dirname} from "path";
import {createDefaultData} from "./system-modules/pkg/pkg-util.js";
import path from "path";
import os from "os";
import AutoGitUpdate from "auto-git-update";
import * as fs from "fs";
import readline from "readline";
import * as util from "util";
import ConfigManager from "./core/ConfigManager/index.js";

global.basePath = dirname(new URL('', import.meta.url).pathname);

let config = ConfigManager.readConfig('core');

if (config === null) {
    console.log("Config not exist.");
    console.log("Starting configuration wizard...");

    let defaultConfig = {
        logger: {
            debug: false,
            dateformat: "DD.MM.YYYY HH:mm:ss"
        },
        "client": {
            "intents": [
                32767
            ]
        }
    }

    let rl = readline.createInterface(process.stdin, process.stdout);
    const question = util.promisify(rl.question).bind(rl);

    let locale = await question("Select language(default \"en\", available \"en\", \"ru\"): ");
    if (!['en', 'ru'].includes(locale)) {
        locale = 'en';
    }

    let token = await question("Enter bot token: ");
    let prefix = await question("Enter prefix(default \"//\"): ");

    if (prefix.length === 0) {
        prefix = "//";
    }

    defaultConfig = {
        ...defaultConfig,
        locale,
        token,
        prefix
    }

    rl.close();
    ConfigManager.writeConfig('core', undefined, defaultConfig);

    console.log("Config saved.");
    config = ConfigManager.readConfig('core');
}

/**
 *
 * @type {Config}
 */
let updaterConfig = {
    repository: "https://github.com/Tenorium/BotCore",
    branch: "master",
    tempLocation: path.join(os.tmpdir(), 'botcore'),
    executeOnComplete: "git submodule update --init"
};

let updater = new AutoGitUpdate(updaterConfig);

await updater.autoUpdate();

i18n.configure({
    locales: ['en', 'ru'],
    directory: "./locales"
});


colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red',
});

createDefaultData()

let core = new Core(config);

core.init();
