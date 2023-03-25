import AbstractModule from "../../types/core/abstractModule";

export default class ModuleManager {

    static autoload(): Promise<void>;
    /**
       *
       * @param {string} name
       */
    static load(name: string): Promise<boolean>;
    /**
       *
       * @param {string} name
       * @return {boolean}
       */
    static unload(name: string): boolean;
    /**
       *
       * @return {string[]}
       */
    static list(): string[];
    /**
       * @return {string[]}
       */
    static listLoaded(): string[];
    /**
       *
       * @param name
       * @return {AbstractModule|null}
       */
    static getModule(name: string): AbstractModule | null;
    static getModule(name: 'cli'): CliModule;
    static getModule(name: 'DiscordNotify'): DiscordNotify;
    static unloadAll(): void;
    static disable(name: string): void;
    static enable(name: string): void;
    static getEventManager(): ModuleEventEmitter;
}
import CliModule from "../../system-modules/cli/cli";
import ModuleEventEmitter from "./event";
import DiscordNotify from "../../modules/DiscordNotify/DiscordNotify";
//# sourceMappingURL=index.d.ts.map
