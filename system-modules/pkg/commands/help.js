export const NAME = 'help';

/**
 * PKG help command
 * @param {import('#system-module/cli').default} cli
 */
export function exec(cli) {
    console.log(`
    remove - 
    install -
    update - 
    list - 
  `);
}

export function complete(trie) {
    trie.insert('pkg help');
}
