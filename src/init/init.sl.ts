import ConfigManager from '@util/configManager.js'

export class ServiceLocator {
  static services: Record<string, any> = {}
  static register (name: string, service: any): void {
    ServiceLocator.services[name] = service
  }

  static get (name: string): any {
    return ServiceLocator.services[name]
  }

  static has (name: string): boolean {
    return (Boolean(ServiceLocator.services[name]))
  }

  static removeAll (): void {
    ServiceLocator.services = {}
  }
}

export default function (): void {
  if (global.app !== undefined) {
    return
  }

  global.app = function<T extends keyof AppServices> (serviceName: T): AppServices[T] {
    return ServiceLocator.get(serviceName)
  }

  ServiceLocator.register(ConfigManager.name, ConfigManager)
  ServiceLocator.register('ServiceLocator', ServiceLocator)
}

// DECLARATION

declare global {
  var app: <T extends keyof AppServices>(serviceName: T) => AppServices[T]
  interface AppServices {
    ConfigManager: typeof ConfigManager
    ServiceLocator: typeof ServiceLocator
  }
}
