import {dirname} from "path";
import getConfig from "./init.d/init.config.js";
import colors from "colors";
import initCore from "./init.d/init.core.js";
import autoUpdate from "./init.d/init.autoupdate.js";

global.basePath = dirname(new URL('', import.meta.url).pathname);

let config = await getConfig();

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
    error: 'red',
});

await initCore(config);