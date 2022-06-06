// @ts-ignore
import EventEmitter from "events";

export default class ModuleEventEmitter extends EventEmitter {
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
    on(eventName: 'moduleLoaded', listener: (moduleName: string) => void): this;
    on(eventName: 'moduleUnloaded', listener: (moduleName: string) => void): this;
    on(eventName: 'autoLoadFinished', listener: () => void): this;

    once(eventName: string | symbol, listener: (...args: any[]) => void): this;
    once(eventName: 'moduleLoaded', listener: (moduleName: string) => void): this;
    once(eventName: 'moduleUnloaded', listener: (moduleName: string) => void): this;
    once(eventName: 'autoLoadFinished', listener: () => void): this;

    emit(eventName: string | symbol, ...args): boolean;
    emit(eventName: 'moduleLoaded', moduleName: string): boolean;
    emit(eventName: 'moduleUnloaded', moduleName: string): boolean;
    emit(eventName: 'autoLoadFinished'): boolean;
}