import { Message } from 'discord.js';
import { EventEmitterWrapper, EventsList } from 'utilslib';
declare class CommandManager extends EventEmitterWrapper<CommandManagerEvents> {
    _className: string;
    constructor();
    /**
       * Register command (chat command, not slash command)
       * @param {!string} commandName
       * @param {CommandHandlerFunc} handler
       * @fires CommandManager#commandRegistered
       * @throws Error
       */
    registerCommand(commandName: string, handler: CommandHandlerFunc): void;
    /**
       * Unregister command
       * @param {!string} commandName
       * @fires CommandManager#commandUnregistered
       * @throws Error
       */
    unregisterCommand(commandName: string): void;
    listCommands(): string[];
    hasCommand(commandName: string): boolean;
    /**
       * Check if command disabled
       * @param {!string} commandName
       * @return {boolean}
       * @throws Error
       */
    isDisabled(commandName: string): boolean;
    /**
       * Disable command
       * @fires CommandManager#commandDisabled
       * @param commandName
       * @throws Error
       */
    disableCommand(commandName: string): void;
    /**
       * Enable command
       * @fires CommandManager#commandEnabled
       * @param commandName
       * @throws Error
       */
    enableCommand(commandName: string): void;
    static _warning: ((message: string) => void);
    static _error: (message: string, e: Error | null) => void;
    static _fatal: (message: string, e: Error | null) => void;
    static _debug: (message: string) => void;
    static _info: (message: string) => void;
}
export default CommandManager;
/**
 * @event CommandsEventEmitter#commandRegistered
 * @type {string}
 */
/**
 * @event CommandsEventEmitter#commandUnregistered
 * @type {string}
 */
/**
 * @event CommandsEventEmitter#commandDisabled
 * @type {string}
 */
/**
 * @event CommandsEventEmitter#commandEnabled
 * @type {string}
 */
export type CommandHandlerFunc = (args: string[], message: Message) => void;
export interface CommandManagerEvents extends EventsList {
    commandRegistered: (commandName: string) => void;
    commandUnregistered: (commandName: string) => void;
    commandDisabled: (commandName: string) => void;
    commandEnabled: (commandName: string) => void;
}
