import Core from '../core/core.js';
import ModuleManager from '../core/ModuleManager.js';
export default async function (config) {
    const moduleManagerClass = new ModuleManager();
    app('ServiceLocator').register('ModuleManager', moduleManagerClass);
    const core = new Core(config);
    app('ServiceLocator').register('Core', core);
}
