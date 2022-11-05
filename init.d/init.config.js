import ConfigManager from "../data/index.js";
import readline from "readline/promises";

export default async function() {
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
        //const question = util.promisify(rl.question).bind(rl);

        let locale = await rl.question("Select language(default \"en\", available \"en\", \"ru\"): ");
        if (!['en', 'ru'].includes(locale)) {
            locale = 'en';
        }

        let token = await rl.question("Enter bot token: ");
        let prefix = await rl.question("Enter prefix(default \"//\"): ");

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
        ConfigManager.writeConfig('core', defaultConfig);

        console.log("Config saved.");
        console.log("For apply selected language restart bot.");
        config = ConfigManager.readConfig('core');
    }

    return config;
}