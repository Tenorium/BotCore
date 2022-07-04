import Core from "./core/core.js";
import config from "./config/core.config.js";
import colors from "colors";
import i18n from "i18n";
import {dirname} from "path";
import {createDefaultData} from "./system-modules/pkg/pkg-util.js";
import path from "path";
import os from "os";
import AutoGitUpdate from "auto-git-update";

global.basePath = dirname(new URL('', import.meta.url).pathname);

/**
 *
 * @type {Config}
 */
let updaterConfig = {
    repository: "https://github.com/Tenorium/BotCore",
    branch: "master",
    tempLocation: path.join(os.tmpdir(), 'botcore')
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
