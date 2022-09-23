import * as fs from "fs";
import path from "path";


export default class ConfigManager {
    /**
     *
     * @param {string} namespace
     * @param {string=} name
     * @return {*|null}
     */
    static readConfig(namespace, name) {
        let configPath = path.join(basePath, `config/${namespace}/${name === undefined ? 'config.json' : `${name}.json`}`);

        if (!fs.existsSync(configPath)) {
            return null;
        }

        return JSON.parse(fs.readFileSync(configPath).toString());
    }

    /**
     *
     * @param {string} namespace
     * @param {string=} name
     * @param {*} data
     */
    static writeConfig(namespace, name, data) {
        let configPath = path.join(basePath, `config/${namespace}/${name === undefined ? 'config.json' : `${name}.json`}`);

        if (!fs.existsSync(path.join(basePath, `config/${namespace}`))) {
            fs.mkdirSync(path.join(basePath, `config/${namespace}`));
        }

        fs.writeFileSync(configPath, JSON.stringify(data));
    }
}