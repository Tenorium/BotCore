import splitargs from 'splitargs'
import AbstractModule from '../../core/abstractModule'
import ModuleManager from '../../core/ModuleManager'
import * as HelpCommand from './commands/help'

export default class PKGModule extends AbstractModule {
  load () {
    /**
    * @type {import('../cli/cli.js').default}
    */
    const cli = ModuleManager.getModule('cli')
    cli.addCommand('pkg',
      function (input) {
        const args = splitargs(input)

        if (args[0] !== 'pkg') {
          return
        }

        cli.pauseCli()

        console.log('BotCore package manager' + '\n')

        switch (args[1]) {
          case 'remove':

            break
          case 'install':
            break
          case 'update':
            break
          case 'list':
            break
          default:
            HelpCommand.exec(cli)
        }

        cli.resumeCli()
      },
      function (/** @type {import('readline-trie-completer')()} */ trie) {
        trie.insert('pkg');
        HelpCommand.complete(trie)
      }
    )
  }

  unload () {

  }
}
