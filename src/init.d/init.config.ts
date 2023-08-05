import readline from 'readline/promises'
import { DataObject, LoggerConfig } from 'utilslib'

export default async function (): Promise<DataObject | null> {
  const configManager = app('ConfigManager')

  let config = configManager.readConfig('core')

  if (config === null) {
    console.log('Config not exist.')
    console.log('Starting configuration wizard...')

    const defaultConfig = new CoreConfig()

    const rl = readline.createInterface(process.stdin, process.stdout)

    let locale = await rl.question('Select language(default "en", available "en", "ru"): ')
    if (!['en', 'ru'].includes(locale)) {
      locale = 'en'
    }

    const token = await rl.question('Enter bot token: ')
    let prefix = await rl.question('Enter prefix(default "//"): ')

    if (prefix.length === 0) {
      prefix = '//'
    }

    defaultConfig.setLocale(locale)
    defaultConfig.setToken(token)
    defaultConfig.setPrefix(prefix)

    rl.close()
    configManager.writeConfig('core', defaultConfig)

    console.log('Config saved.')
    console.log('For apply selected language restart bot.')
    config = configManager.readConfig('core')
  }

  return config
}

export class CoreConfig extends DataObject {
  constructor (data: {
    logger: LoggerConfig
    client: ClientConfig
    locale: string
    token: string
    prefix: string
  } = {
    logger: new LoggerConfig(),
    client: new ClientConfig(),
    locale: 'en',
    token: '',
    prefix: '//'
  }) {
    super(data)
  }

  getLoggerConfig (): LoggerConfig {
    return this.getDataObjectFromField('logger') as LoggerConfig
  }

  setLoggerConfig (config: LoggerConfig): void {
    this.setField('logger', config)
  }

  getClientConfig (): ClientConfig {
    return this.getDataObjectFromField('client') as ClientConfig
  }

  setClientConfig (config: ClientConfig): void {
    this.setField('client', config)
  }

  getLocale (): string {
    return this.getField('locale')
  }

  setLocale (locale: string): void {
    this.setField('locale', locale)
  }

  getToken (): string {
    return this.getField('token')
  }

  setToken (token: string): void {
    this.setField('token', token)
  }

  getPrefix (): string {
    return this.getField('prefix')
  }

  setPrefix (prefix: string): void {
    this.setField('prefix', prefix)
  }
}

export class ClientConfig extends DataObject {
  constructor (data: { intents: number[] } = { intents: [32767] }) {
    super(data)
  }

  getIntents (): number[] {
    return this.getField('intents')
  }

  setIntents (intents: number[]): void {
    this.setField('intents', intents)
  }
}
