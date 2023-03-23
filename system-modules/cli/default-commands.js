/**
 *
 * @param {CliModule} cli
 */

export const run = function (cli) {
  cli.addCommand('shutdown',
    function (input) {
      app().shutdown();
    },
    function (trie) {
      trie.insert('shutdown');
    }
  );
  cli.addCommand('exit',
    function (input) {
      app().shutdown();
    },
    function (trie) {
      trie.insert('exit');
    })
}
