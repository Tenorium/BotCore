import {dirname} from "path";
import getConfig from "./init.d/init.config.js";
import colors from "colors";
import initCore from "./init.d/init.core.js";
import os from "os";
import AutoGitUpdate from "auto-git-update";
import path from "path";

global.basePath = dirname(new URL('', import.meta.url).pathname);

let config = await getConfig();

/**
 *
 * @type {import('auto-git-update').Config}
 */
let updaterConfig = {
    repository: "https://github.com/Tenorium/BotCore",
    branch: "master",
    tempLocation: path.join(os.tmpdir(), 'botcore'),

};

let updater = new AutoGitUpdate(updaterConfig);

await updater.autoUpdate();

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

await initCore(config);