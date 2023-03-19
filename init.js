import path, {dirname} from 'path';
import getConfig from './init.d/init.config.js';
import colors from 'colors';
import initCore from './init.d/init.core.js';
import autoUpdate from './init.d/init.autoupdate.js';
import fs from "fs";
import * as util from "util";

/**
 * @global
 * @type {string}
 */
global.basePath = dirname(new URL('', import.meta.url).pathname);

const config = await getConfig();

await autoUpdate();

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
    error: 'red'
});

const logFile = fs.createWriteStream(path.join(basePath, 'log.txt'), {flags: 'a'});

console.log = function () {
    let message = '';
    for (let i = 0; i < arguments.length; i++) {
        message += util.format(arguments[i]) + ' ';
    }
    process.stdout.write(message.trim() + '\n');
    logFile.write(message.trim() + '\n');
}

await initCore(config);
