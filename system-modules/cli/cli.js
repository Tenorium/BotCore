import readline from 'readline';
import AbstractModule from '#abstractModule';
import Logger from '#util/log';
import { run } from './default-commands.js';
import ModuleManager from '#moduleManager';
import * as TrieCompleter from 'readline-trie-completer';
import splitargs from 'splitargs';

const TrieCommonJS = TrieCompleter.default;

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
 * @param {import('readline-trie-completer').default().trie} trie
 * @param {boolean=false} remove
 */

/**
 *
 * @type {Object<string,{handlerIndex: number, completerIndex: number}>}
 */
const commands = {};
const completions = [];
const handlers = [];

const trieCompleter = TrieCommonJS()

const commandHandler = function (input) {
  handlers.forEach(function (value) {
    value(input);
  })
}

export default class CliModule extends AbstractModule {
  load () {
    Logger.info('CLI module loading!');

    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: trieCompleter.completer
    });

    rl.addListener('line', function (input) {
      rl.pause();
      commandHandler(input);
      if (isClosed) {
        return;
      }

      rl.resume();
      rl.prompt();
    })
    rl.addListener('close', () => {
      isClosed = true;
    })
    rl.addListener('SIGINT', function () {
      app().shutdown();
    })

    run(this);

    ModuleManager.getEventManager().once('autoLoadFinished', () => {
      rl.prompt();
    })
  }

  /**
     *
     * @type {AddCommandFunc}
     */
  addCommand (command, commandHandler, commandCompleter = null) {
    const handlerIndex = handlers.push(
      function (input) {
        const args = splitargs(input);
        if (args[0] === command) {
          ModuleManager.getModule('cli').pauseCli();
          commandHandler(input.substring(`${command} `.length));
          ModuleManager.getModule('cli').resumeCli();
        }
      }
    ) - 1;
    let completerIndex;
    if (commandCompleter) {
      commandCompleter(trieCompleter.trie);
      completerIndex = completions.push(commandCompleter) - 1;
    }

    commands[command] = { handlerIndex, completerIndex: completerIndex ?? null };
  }

  /**
     *
     * @type {RemoveCommandFunc}
     */
  removeCommand (command) {
    const { handlerIndex, completerIndex } = commands[command];

    delete handlers[handlerIndex];
    if (!completerIndex) {
      return;
    }
    completions[completerIndex](trieCompleter.trie, true);
    delete completions[completerIndex];
  }

  pauseCli () {
    isClosed = true;
    if (!rl.paused) {
      rl.pause();
    }
  }

  resumeCli () {
    isClosed = false;
    if (rl.paused) {
      rl.resume();
    }
    // rl.prompt();
  }

  /**
   *
   * @return {import('readline-trie-completer').default().trie}
   */
  getCompleter () {
    return trieCompleter.trie;
  }

  unload () {
    Logger.info('Closing CLI...');
    rl.close();
  }
}
