import readline from 'readline/promises'
import { DataObject, LoggerConfig } from '@tenorium/utilslib'
import { ClientOptions } from 'discord.js'

export default async function (): Promise<CoreConfig> {
  const configManager = app('ConfigManager');

  const configData = configManager.readConfig('core')?.getData() as CoreConfigDataType ?? undefined

  const config = new CoreConfig(configData)

  if (configData === undefined) {
    console.log('Config not exist.')
    console.log('Starting configuration wizard...')

    const defaultConfig = new CoreConfig()

    const rl = readline.createInterface(process.stdin, process.stdout)

    console.log('Select language (default "en", available "en", "ru"): ')
    let locale = await rl.question('')
    if (!['en', 'ru'].includes(locale)) {
      locale = 'en'
    }

    console.log('Enter bot token: ')
    const token = await rl.question('')

    console.log('Enter prefix (default "//"): ')
    let prefix = await rl.question('')

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
    return defaultConfig
  }

  return config
}

export class CoreConfig extends DataObject {
  constructor (data: CoreConfigDataType = {
    logger: new LoggerConfig(),
    client: new ClientConfig(),
    locale: 'en',
    token: '',
    prefix: '//'
  }) {
    super(data)
  }

  getLoggerConfig (): LoggerConfig {
    return new LoggerConfig(this.getDataObjectFromField('logger')?.getData() as { debug: boolean, dateformat: string })
  }

  setLoggerConfig (config: LoggerConfig): void {
    this.setField('logger', config)
  }

  getClientConfig (): ClientConfig {
    return new ClientConfig(this.getDataObjectFromField('client')?.getData() as ClientOptions | undefined)
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
  constructor (data: ClientOptions = { intents: [32767] }) {
    super(data)
  }

  getIntents (): number[] {
    return this.getField('intents')
  }

  setIntents (intents: number[]): void {
    this.setField('intents', intents)
  }
}

// DECLARATIONS
declare interface CoreConfigDataType {
  logger: LoggerConfig
  client: ClientConfig
  locale: string
  token: string
  prefix: string
}
