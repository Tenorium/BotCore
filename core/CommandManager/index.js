import args from "splitargs";
import Core from "../core.js";
import {Message, MessageMentions} from "discord.js";
import Logger from "../log.js";
import CommandAlreadyRegisteredError from "./error/CommandAlreadyRegisteredError.js";
import CommandNotExist from "./error/CommandNotExist.js";
import CommandEventEmitter from "./event.js";

const disabledCommands = [];

export default class CommandManager {
    static #commands = {};
    static #em = new CommandEventEmitter();

    /**
     * Register command (chat command, not slash command)
     * @param {!string} commandName
     * @param {CommandHandlerFunc} handler
     * @fires CommandEventEmitter#commandRegistered
     * @throws CommandAlreadyRegisteredError
     */
    static registerCommand(commandName, handler) {
        if (!CommandManager.#commands.hasOwnProperty(commandName)) {
            let uuid = Core.getCore().registerClientEvent('messageCreate', this.#getWrapper(handler, commandName))
            CommandManager.#commands[commandName] = {handler, uuid};

            this.getEventManager().emit('commandRegistered', commandName);
            return;
        }

        throw new CommandAlreadyRegisteredError();
    }

    /**
     * Unregister command
     * @param {!string} commandName
     * @fires CommandEventEmitter#commandUnregistered
     * @throws CommandNotExist
     */
    static unregisterCommand(commandName) {
        if (CommandManager.#commands.hasOwnProperty(commandName)) {
            Core.getCore().unregisterClientEvent(CommandManager.#commands [commandName].uuid);
            delete CommandManager.#commands[commandName];
            return;
        }

        throw new CommandNotExist();
    }

    /**
     * Return list of registered commands
     * @return {string[]}
     */
    static listCommands() {
        return Object.keys(CommandManager.#commands).map(key => key);
    }

    /**
     * Check if command registered
     * @param {!string} commandName
     * @return {*}
     */
    static hasCommand(commandName) {
        return Object.keys(CommandManager.#commands).includes(commandName);
    }

    /**
     * Check if command disabled
     * @param {!string} commandName
     * @return {boolean}
     * @throws CommandNotExist
     */
    static isDisabled(commandName) {
        if (!this.hasCommand(commandName)) {
            throw new CommandNotExist();
        }

        return disabledCommands.includes(commandName);
    }

    /**
     * Disable command
     * @fires CommandEventEmitter#commandDisabled
     * @param commandName
     * @throws CommandNotExist
     */
    static disableCommand(commandName) {
        if (!this.isDisabled(commandName)) {
            disabledCommands.push(commandName);
        }

        this.getEventManager().emit('commandDisabled', commandName);
    }

    /**
     * Enable command
     * @fires CommandEventEmitter#commandEnabled
     * @param commandName
     * @throws CommandNotExist
     */
    static enableCommand(commandName) {
        if (this.isDisabled(commandName)) {
            let index = disabledCommands.indexOf(commandName);
            if (index !== -1) {
                disabledCommands.splice(index, 1);
            }
        }

        this.getEventManager().emit('commandEnabled', commandName);
    }

    /**
     * @return {CommandEventEmitter}
     */
    static getEventManager() {
        return this.#em;
    }

    /**
     *
     * @param {CommandHandlerFunc} handler
     * @param {string} command
     * @return {(function(Message): void)}
     * @private
     */
    static #getWrapper(handler, command) {
        return function (message) {
            let prefix = Core.getCore().getConfig()['prefix'];
            if (
                !(message.content.startsWith(prefix)
                    || MessageMentions.USERS_PATTERN.test(message.content))
            ) {
                return;
            }

            let prefix_;

            if (message.content.startsWith(prefix)) {
                prefix_ = prefix;
            }

            if (!prefix_) {
                prefix_ = message.content.match(MessageMentions.USERS_PATTERN)[0];
            }
            if (!message.content.replace(prefix_, '').startsWith(command)) {
                return;
            }

            if (disabledCommands.includes(command)) {
                disabledCommandHandler(command, message);
                return;
            }

            try {
                handler(args(message.content.replace(`${prefix_ + command}`, '').trim()), message);
            } catch (e) {
                errorCommandHandler(command, message, e);
            }
        }
    };
}

/**
 * @typedef CommandHandlerFunc
 * @type function
 * @param {string[]} args
 * @param {Message} message
 *
 */

/**
 * Reply message about disabled command
 * @param {string} command
 * @param {Message} message
 */
const disabledCommandHandler = function (command, message) {
    let client = Core.getCore().getClient();

    message.reply({
        embeds: [
            {
                author: {
                    name: client.user.name,
                    iconURL: client.user.avatarURL()
                },
                color: "GOLD",
                title: i18n.t('commandManager:disabled_title'),
                description: i18n.t('commandManager:disabled_description', {command})
            }
        ]
    });
}

/**
 * Reply message about errored command
 * @param {string} command
 * @param {Message} message
 * @param {Error} e
 */
const errorCommandHandler = function (command, message, e) {
    let client = Core.getCore().getClient();

    message.reply({
        embeds: [
            {
                author: {
                    name: client.user.name,
                    iconURL: client.user.avatarURL()
                },
                color: "RED",
                title: i18n.t('commandManager:error_description'),
                description: i18n.t('commandManager:error_description', {command})
            }
        ]
    });

    Logger.error("Unhandled error from command.\n", e);
}

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