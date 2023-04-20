import ConfigManager from '#configManager';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export default async function () {
  function removeEscapeChars (arg) {
    // Удалить кавычки в начале и конце строки (если они есть)
    arg = arg.replace(/^"(.+(?="$))"$/, '$1');
    // Удалить символы экранирования
    arg = arg.replace(/\\(.)/g, '$1');
    return arg;
  }

  const args = yargs(hideBin(process.argv))
    .scriptName('skynet')
    .version(false)
    .option('host', {
      describe: 'IP of server',
      type: 'string',
      coerce: removeEscapeChars
    })
    .option('port', {
      type: 'string',
      coerce: removeEscapeChars
    })
    .option('version', {
      // choices: ['1.8', '1.9', '1.10', '1.11', '1.12', '1.13', '1.14', '1.15', '1.16', '1.17', '1.18', '1.19'],
      type: 'string',
      coerce: removeEscapeChars
    })
    .option('username', {
      type: 'string',
      coerce: removeEscapeChars
    })
    .option('password', {
      type: 'string',
      coerce: removeEscapeChars
    })
    .option('worker', {
      type: 'boolean',
      default: false
    })
    .option('worker-count', {
      type: 'number',
      default: 1
    })
    .option('config', {
      type: 'string',
      coerce: removeEscapeChars
    })
    .parse();

  global.args = args;

  if (args.worker) {
    ConfigManager.setConfigObject(JSON.parse(args.config));
  }

  let config = ConfigManager.readConfig('core', 'old');

  if (config === null) {
    console.log('Config not exist.');
    console.log('Creating default config...');

    const defaultConfig = {
      logger: {
        debug: false, dateformat: 'DD.MM.YYYY HH:mm:ss'
      },
      client: {
        host: null,
        port: 25565,
        username: 'skynet',
        version: '1.12.2',
        password: 'password'
      }
    };

    ConfigManager.writeConfig('core', defaultConfig);

    console.log('Config saved.');
    config = ConfigManager.readConfig('core');
  }

  let configChanged = false;

  if (args.host !== undefined) {
    config.client.host = args.host;
    configChanged = true;
  }

  if (args.port !== undefined) {
    config.client.port = args.port;
    configChanged = true;
  }

  if (args.username !== undefined) {
    config.client.username = args.username;
    configChanged = true;
  }

  if (args.version !== undefined) {
    config.client.version = args.version;
    configChanged = true;
  }

  if (args.password !== undefined) {
    config.client.password = args.password;
    configChanged = true;
  }

  if (configChanged) {
    ConfigManager.writeConfig('core', config);
  }

  return config;
}
