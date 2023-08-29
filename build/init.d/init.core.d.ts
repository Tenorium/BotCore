import Core from '../core/core.js';
import { CoreConfig } from './init.config.js';
import ModuleManager from '../core/ModuleManager.js';
export default function (config: CoreConfig): Promise<void>;
declare global {
    interface AppServices {
        Core: Core;
        ModuleManager: ModuleManager;
    }
}
