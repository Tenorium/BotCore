// @ts-ignore
import EventEmitter from "events";

export default class CommandEventEmitter extends EventEmitter {
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
    on(eventName: 'commandRegistered', listener: (commandName: string) => void): this;
    on(eventName: 'commandUnregistered', listener: (commandName: string) => void): this;
    on(eventName: 'commandDisabled', listener: (commandName: string) => void): this;
    on(eventName: 'commandEnabled', listener: (commandName: string) => void): this;

    once(eventName: string | symbol, listener: (...args: any[]) => void): this;
    once(eventName: 'commandRegistered', listener: (commandName: string) => void): this;
    once(eventName: 'commandUnregistered', listener: (commandName: string) => void): this;
    once(eventName: 'commandDisabled', listener: (commandName: string) => void): this;
    once(eventName: 'commandEnabled', listener: (commandName: string) => void): this;

    emit(eventName: 'commandRegistered', commandName: string): boolean;
    emit(eventName: 'commandUnregistered', commandName: string): boolean;
    emit(eventName: 'commandDisabled', commandName: string): boolean;
    emit(eventName: 'commandEnabled', commandName: string): boolean;
}