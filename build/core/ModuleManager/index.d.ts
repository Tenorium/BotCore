import AbstractModule from '../abstractModule.js';
import { EventEmitterWrapper, EventsList } from 'utilslib';
declare class ModuleManager extends EventEmitterWrapper<ModuleManagerEvents> {
    #private;
    static _className: string;
    autoload(): Promise<void>;
    /**
       *
       * @param {string} name
       */
    load(name: string): Promise<boolean>;
    unload(name: string): boolean;
    list(): string[];
    listLoaded(): string[];
    getModule(name: string): AbstractModule | null;
    unloadAll(): void;
    disable(name: string): void;
    enable(name: string): void;
    static _warning: ((message: string) => void);
    static _error: (message: string, e: Error | null) => void;
    static _fatal: (message: string, e: Error | null) => void;
    static _debug: (message: string) => void;
    static _info: (message: string) => void;
}
export default ModuleManager;
export interface ModuleManagerEvents extends EventsList {
    autoLoadFinished: () => void;
    moduleLoaded: (moduleName: string) => void;
    moduleUnloaded: (moduleName: string) => void;
}
