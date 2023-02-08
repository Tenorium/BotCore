/**
 *
 * @param {CliModule} cli
 */
import splitargs from 'splitargs';
import CommandManager from '#commandManager';

export const run = function (cli) {
  cli.addCommand('shutdown',
    function (input) {
      const args = splitargs(input);

      if (args[0] === 'shutdown') {
        app().shutdown();
      }
    },
    function (line) {
      return 'shutdown'.startsWith(line) ? ['shutdown'] : null;
    }
  )

  cli.addCommand('command',
    function (input) {
      const args = splitargs(input);

      if (args[0] !== 'command') {
        return;
      }

      const checkCommand = function () {
        const commandName = args[2] ?? null;
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
          list = list.map(value => (CommandManager.isDisabled(value) ? '[D] ' : '[E] ') + value);
          console.log(list.join('\n'));
      }
    },
    function (line) {
      const getCommands = function () {
        const commands = CommandManager.listCommands();
        const hits = commands.filter(value => value.startsWith(line.replace(args[0] + args[1]).trim()));
        let arr = hits;

        if (!hits.length) {
          arr = commands;
        }
        return arr.map(value => `${args[0]} ${args[1]} ${value}`);
      }
      const args = splitargs(line);
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
          const subcommands = ['disable', 'enable', 'list'];
          const filtered = subcommands.filter(value => value.startsWith(args[1]));
          let arr = filtered;
          if (!filtered.length) {
            arr = subcommands;
          }

          return arr.map(value => 'command ' + value);
      }
    })
}
