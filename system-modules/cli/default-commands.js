/**
 *
 * @param {CliModule} cli
 */
import Core from "../../core/core.js";
import splitargs from "splitargs";
import CommandManager from "../../core/CommandManager/index.js";

export const run = function (cli) {

    cli.addCommand('shutdown',
        function (input) {
            let args = splitargs(input);

            if (args[0] === 'shutdown') {
                Core.getCore().shutdown();
            }
        },
        function (line) {
            return 'shutdown'.startsWith(line) ? ['shutdown'] : null;
        }
    );

    cli.addCommand('command',
        function (input) {
            let args = splitargs(input);

            if (args[0] !== 'command') {
                return;
            }

            let checkCommand = function () {
                let commandName = args[2] ?? null;
                if (!commandName || commandName.length === 0) {
                    console.log('Please, enter command name!');
                    return false;
                }

                if (!CommandManager.listCommands().includes(commandName)) {
                    console.log('Command don\'t exists!');
                    return false;
                }

                return true;
            }

            switch (args[1]) {
                case 'disable':
                    if (!checkCommand()) {
                        return;
                    }

                    CommandManager.disableCommand(args[2]);
                    return;
                case 'enable':
                    if (!checkCommand()) {
                        return;
                    }

                    CommandManager.enableCommand(args[2]);
                    return;
                case 'list':
                    let list = CommandManager.listCommands();
                    list = list.map(value => (CommandManager.isDisabled(value) ? '[D] ' : '[E] ') + value)
                    console.log(list.join('\n'));
            }
        },
        function (line) {
            let getCommands = function () {
                let commands = CommandManager.listCommands()
                let hits = commands.filter(value => value.startsWith(line.replace(args[0] + args[1]).trim()));
                let arr = hits;

                if (!hits.length) {
                    arr = commands;
                }
                return arr.map(value => `${args[0]} ${args[1]} ${value}`)
            }
            let args = splitargs(line);
            if (args[0] !== 'command') {
                if ('command'.startsWith(line)) {
                    return ['command'];
                }
                return null;
            }

            switch (args[1]) {
                case 'disable':
                    return getCommands();
                case 'enable':
                    return getCommands();
                case 'list':
                    return ['command list'];
                default:
                    let subcommands = ['disable', 'enable', 'list'];
                    let filtered = subcommands.filter(value => value.startsWith(args[1]));
                    let arr = filtered;
                    if (!filtered.length) {
                        arr = subcommands;
                    }

                    return arr.map(value => 'command ' + value);
            }
        });
}