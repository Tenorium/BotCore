import AbstractModule from '#abstractModule';
import ModuleManager from '#moduleManager';
import splitargs from 'splitargs';

export default class ModuleManagerCLI extends AbstractModule {
  #completer;

  load () {
    const cli = ModuleManager.getModule('cli');

    if (!cli) {
      return;
    }

    ModuleManager.getModule('cli').addCommand(
      'module',
      function (line) {
        const args = splitargs(line);

        if (args.length === 0) {
          console.log('Please select subcommand!');
          return;
        }

        const checkIfSecondArgExist = function () {
          if (args.length < 2) {
            console.log('Please enter module name');
            return false;
          }

          return true;
        }

        switch (args[0]) {
          case 'list':
            console.log(ModuleManager.list().join('\n'));
            break;
          case 'unload':
            if (!checkIfSecondArgExist()) break;
            ModuleManager.unload(args[1]);
            break;
          case 'load':
            if (!checkIfSecondArgExist()) break;
            ModuleManager.load(args[1]);
            break;
          case 'reload':
            if (!checkIfSecondArgExist()) break;
            ModuleManager.unload(args[1]);
            ModuleManager.load(args[1]);
            break;
          case 'disable':
            if (!checkIfSecondArgExist()) break;
            ModuleManager.disable(args[1]);
            ModuleManager.unload(args[1]);
            break;
          case 'enable':
            if (!checkIfSecondArgExist()) break;
            ModuleManager.enable(args[1]);
            ModuleManager.load(args[1]);
            break;
        }
      },
      function (trie, remove) {
        if (remove) {
          trie.remove('module load');
          trie.remove('module unload');
          trie.remove('module reload');
          trie.remove('module list');
          trie.remove('module enable');
          trie.remove('module disable');
          return;
        }

        trie.insert('module load');
        trie.insert('module unload');
        trie.insert('module reload');
        trie.insert('module list');
        trie.insert('module enable');
        trie.insert('module disable');
      })
  }

  unload () {
    const cli = ModuleManager.getModule('cli');

    if (!cli) {
      return;
    }

    ModuleManager.getModule('cli').removeCommand('module');
  }
}
