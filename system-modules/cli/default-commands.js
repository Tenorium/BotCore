/**
 *
 * @param {CliModule} cli
 */
import splitargs from 'splitargs';
import CommandManager from '#commandManager';

export const run = function (cli) {
  cli.addCommand('shutdown',
    function (input) {
      app().shutdown();
    },
    function (line) {
      return 'shutdown'.startsWith(line) ? ['shutdown'] : null;
    }
  )

  cli.addCommand('command',
    function (input) {
      const args = splitargs(input);

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
          // eslint-disable-next-line no-case-declarations
          let list = CommandManager.listCommands();
          list = list.map(value => (CommandManager.isDisabled(value) ? '[D] ' : '[E] ') + value);
          console.log(list.join('\n'));
      }
    },
    function (trie, remove) {
      if (remove) {
        trie.remove('command');
        trie.remove('command list');

        const commands = CommandManager.listCommands();

        commands.forEach(value => {
          trie.remove(`command disable ${value}`);
          trie.remove(`command enable ${value}`);
        });
        return;
      }

      trie.insert('command');
      trie.insert('command list');

      const commands = CommandManager.listCommands();

      commands.forEach(value => {
        trie.insert(`command disable ${value}`);
        trie.insert(`command enable ${value}`);
      });
    })
}
