import ConfigManager from '../util/configManager.js';
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ServiceLocator {
    static services = {};
    static register(name, service) {
        ServiceLocator.services[name] = service;
    }
    static get(name) {
        return ServiceLocator.services[name];
    }
    static has(name) {
        return (Boolean(ServiceLocator.services[name]));
    }
    static remove(name) {
        if (!ServiceLocator.has(name)) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete ServiceLocator.services[name];
    }
    static removeAll() {
        ServiceLocator.services = {};
    }
}
export default function () {
    if (global.app !== undefined) {
        return;
    }
    global.app = function (serviceName) {
        return ServiceLocator.get(serviceName);
    };
    ServiceLocator.register(ConfigManager.name, ConfigManager);
    ServiceLocator.register('ServiceLocator', ServiceLocator);
}
