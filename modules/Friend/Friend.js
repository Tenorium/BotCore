import AbstractModule from '#abstractModule';
import ConfigManager from '#configManager';
import ModuleManager from '#moduleManager';
import splitargs from 'splitargs';

const checkIfSecondArgExist = function (args) {
  if (args.length < 2) {
    console.log('Please enter player name');
    return false;
  }

  return true;
}

export default class Friend extends AbstractModule {
  #friends = [];
  #enemies = [];
  load () {
    const cli = ModuleManager.getModule('cli');
    let config = ConfigManager.readConfig('friend');

    if (config === null) {
      config = {
        friends: ['HACKERPRO17', 'noomercy_'],
        enemies: []
      };
      ConfigManager.writeConfig('friend', config);
    }

    if (cli) {
      cli.addCommand(
        'friend',
        function (line) {
          const args = splitargs(line);

          /** @type {Friend} */
          const module = ModuleManager.getModule('Friend');

          switch (args[0]) {
            case 'add':
              if (!checkIfSecondArgExist(args)) break;
              module.addFriend(args[1]);
              break;
            case 'remove':
              if (!checkIfSecondArgExist(args)) break;
              module.removeFriend(args[1]);
              break;
            case 'list':
              if (!checkIfSecondArgExist(args)) break;
              console.log(module.getFriendList().join('\n'));
              break;
          }
        },
        function (trie, remove) {
          if (remove) {
            trie.remove('friend add');
            trie.remove('friend remove');
            trie.remove('friend list');

            trie.remove('enemy add');
            trie.remove('enemy remove');
            trie.remove('enemy list');
            return;
          }

          trie.insert('friend add');
          trie.insert('friend remove');
          trie.insert('friend list');

          trie.insert('enemy add');
          trie.insert('enemy remove');
          trie.insert('enemy list');
        }
      );

      cli.addCommand(
        'enemy',
        function (line) {
          const args = splitargs(line);

          /** @type {Friend} */
          const module = ModuleManager.getModule('Friend');

          switch (args[0]) {
            case 'add':
              if (!checkIfSecondArgExist(args)) break;
              module.addEnemy(args[1]);
              break;
            case 'remove':
              if (!checkIfSecondArgExist(args)) break;
              module.removeEnemy(args[1]);
              break;
            case 'list':
              if (!checkIfSecondArgExist(args)) break;
              console.log(module.getEnemyList().join('\n'));
              break;
          }
        },
        function (trie, remove) {
          if (remove) {
            trie.remove('enemy add');
            trie.remove('enemy remove');
            trie.remove('enemy list');
            return;
          }

          trie.insert('enemy add');
          trie.insert('enemy remove');
          trie.insert('enemy list');
        }
      );
    }
  }

  unload () {

  }

  getFriendList () {
    return this.#friends;
  }

  getEnemyList () {
    return this.#enemies;
  }

  addFriend (name) {
    if (this.#friends.includes(name)) return;

    let enemyIndex;

    if ((enemyIndex = this.#enemies.indexOf(name)) !== -1) {
      delete this.#enemies[enemyIndex];
    }

    this.#friends.push(name);
    this.saveConfig();
  }

  removeFriend (name) {
    let index;
    if ((index = this.#friends.indexOf(name)) === -1) return;

    delete this.#friends[index];
    this.saveConfig();
  }

  addEnemy (name) {
    if (this.#enemies.includes(name)) return;

    let friendIndex;
    if ((friendIndex = this.#friends.indexOf(name)) !== -1) {
      delete this.#friends[friendIndex];
    }

    this.#enemies.push(name);
    this.saveConfig();
  }

  removeEnemy (name) {
    let index;
    if ((index = this.#enemies.indexOf(name)) === -1) return;

    delete this.#enemies[index];
    this.saveConfig();
  }

  saveConfig () {
    ConfigManager.writeConfig('friend', {
      friends: this.#friends,
      enemies: this.#enemies
    })
  }
}
