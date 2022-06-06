import readline from "readline";
import AbstractModule from "../../core/abstractModule.js";
import Logger from "../../core/log.js";
import Core from "../../core/core.js";
import {run} from "./default-commands.js";
import ModuleManager from "../../core/ModuleManager/index.js";

let rl;
let isClosed = false;

/**
 * @typedef AddCommandFunc
 * @type function
 * @param {!string} command
 * @param {!CommandHandler} commandHandler
 * @param {?CommandCompleter} commandCompleter
 * @returns {boolean}
 */

/**
 * @typedef RemoveCommandFunc
 * @type function
 * @param {!string} command
 * @return {boolean}
 */

/**
 * @typedef CommandHandler
 * @type function
 * @param {!string} input
 * @return {void}
 */

/**
 * @typedef CommandCompleter
 * @type function
 * @param {!string} line
 * @return {array|null}
 */



/**
 *
 * @type {Object<string,{handlerIndex: number, completerIndex: number}>}
 */
let commands = {};
let completions = [];
let handlers = [];

let completer = function (line) {
    let hits = [];
    completions.forEach(function (value) {
        let result = value(line);
        if (Array.isArray(result)) {
            hits = hits.concat(result);
        }
    });

    return [hits, line];
}

let commandHandler = function (input) {
    handlers.forEach(function (value) {
        value(input);
    })
}

export default class CliModule extends AbstractModule {

    load() {
        Logger.info('CLI module loading!');

        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            completer: completer
        });

        rl.addListener("line", function (input) {
            rl.pause();
            commandHandler(input);
            if (isClosed) {
                return;
            }

            rl.resume();
            rl.prompt();
        });
        rl.addListener("close", () => {
            isClosed = true;
        });
        rl.addListener("SIGINT", function () {
            Core.getCore().shutdown();
        });

        run(this);

        ModuleManager.getEventManager().once('autoLoadFinished', () => {
            rl.prompt();
        });

    }

    /**
     *
     * @type {AddCommandFunc}
     */
    addCommand(command, commandHandler, commandCompleter = null) {


        let handlerIndex = handlers.push(commandHandler) - 1;
        let completerIndex;
        if (commandCompleter) {
            completerIndex = completions.push(commandCompleter) - 1;
        }

        commands[command] = {handlerIndex, completerIndex: completerIndex ?? null};
    }

    /**
     *
     * @type {RemoveCommandFunc}
     */
    removeCommand(command) {
        const {handlerIndex, completerIndex} = commands[command];

        delete handlers[handlerIndex];
        if (!completerIndex) {
            return;
        }
        delete completions[completerIndex];
    }

    pauseCli() {
        isClosed = true;
        if (!rl.paused) {
            rl.pause();
        }
    }

    resumeCli() {
        isClosed = false;
        if (rl.paused) {
            rl.resume();
        }
        //rl.prompt();
    }

    unload() {
        Logger.info('Closing CLI...');
        rl.close();
    }
}