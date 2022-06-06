import Core from "./core/core.js";
import config from "./config/core.config.js";
import colors from "colors";
import i18n from "i18n";
import {dirname} from "path";

global.basePath = dirname(new URL('', import.meta.url).pathname);

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



let core = new Core(config);

core.init();
