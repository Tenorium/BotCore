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
    static getModule(name: 'DiscordNotify'): DiscordNotify|null;
    static getModule(name: 'Combat'): Combat|null;
    static getModule(name: 'LocalDetect'): LocalDetect|null;
    static getModule(name: 'Friend'): Friend|null;
    static unloadAll(): void;
    static disable(name: string): void;
    static enable(name: string): void;
    static getEventManager(): ModuleEventEmitter;
}
import CliModule from "../../system-modules/cli/cli";
import ModuleEventEmitter from "./event";
import DiscordNotify from "../../modules/DiscordNotify/DiscordNotify";
import Combat from "../../modules/Combat/Combat";
import LocalDetect from "../../modules/LocalDetect/LocalDetect";
import Friend from "../../modules/Friend/Friend";
//# sourceMappingURL=index.d.ts.map
