import readline from 'readline/promises';
import { DataObject, LoggerConfig } from 'utilslib';
export default async function () {
    const configManager = app('ConfigManager');
    const configData = configManager.readConfig('core')?.getData() ?? undefined;
    const config = new CoreConfig(configData);
    if (configData === null) {
        console.log('Config not exist.');
        console.log('Starting configuration wizard...');
        const defaultConfig = new CoreConfig();
        const rl = readline.createInterface(process.stdin, process.stdout);
        let locale = await rl.question('Select language(default "en", available "en", "ru"): ');
        if (!['en', 'ru'].includes(locale)) {
            locale = 'en';
        }
        const token = await rl.question('Enter bot token: ');
        let prefix = await rl.question('Enter prefix(default "//"): ');
        if (prefix.length === 0) {
            prefix = '//';
        }
        defaultConfig.setLocale(locale);
        defaultConfig.setToken(token);
        defaultConfig.setPrefix(prefix);
        rl.close();
        configManager.writeConfig('core', defaultConfig);
        console.log('Config saved.');
        console.log('For apply selected language restart bot.');
        return defaultConfig;
    }
    return config;
}
export class CoreConfig extends DataObject {
    constructor(data = {
        logger: new LoggerConfig(),
        client: new ClientConfig(),
        locale: 'en',
        token: '',
        prefix: '//'
    }) {
        super(data);
    }
    getLoggerConfig() {
        return this.getDataObjectFromField('logger');
    }
    setLoggerConfig(config) {
        this.setField('logger', config);
    }
    getClientConfig() {
        return this.getDataObjectFromField('client');
    }
    setClientConfig(config) {
        this.setField('client', config);
    }
    getLocale() {
        return this.getField('locale');
    }
    setLocale(locale) {
        this.setField('locale', locale);
    }
    getToken() {
        return this.getField('token');
    }
    setToken(token) {
        this.setField('token', token);
    }
    getPrefix() {
        return this.getField('prefix');
    }
    setPrefix(prefix) {
        this.setField('prefix', prefix);
    }
}
export class ClientConfig extends DataObject {
    constructor(data = { intents: [32767] }) {
        super(data);
    }
    getIntents() {
        return this.getField('intents');
    }
    setIntents(intents) {
        this.setField('intents', intents);
    }
}
