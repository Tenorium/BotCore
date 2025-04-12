import { I18n } from 'i18n'
import { readdirSync, unlinkSync, rmdirSync } from 'fs'
import { join } from 'path'

const localesPath = join(basePath, 'locales/')

export default class LocaleManager {
  static getI18n (packageName: string): I18n {
    const i18n = new I18n({
      locales: this.listLocales(packageName),
      directory: join(localesPath, packageName),
      defaultLocale: 'en'
    })

    return i18n
  }

  static listLocales (packageName: string): string[] {
    if (!this.listPackages().includes(packageName)) {
      throw new Error(`Locale package ${packageName} does not exist`)
    }

    return readdirSync(
      join(localesPath, packageName),
      { withFileTypes: true }
    )
      .filter(dirent => dirent.isFile() && dirent.name.endsWith('.json'))
      .map(dirent => dirent.name.replace('.json', ''))
  }

  static listPackages (): string[] {
    return readdirSync(
      localesPath,
      { withFileTypes: true }
    )
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
  }

  static removePackage (packageName: string): void {
    if (!this.listPackages().includes(packageName)) {
      throw new Error(`Locale package ${packageName} does not exist`)
    }

    const packagePath = join(localesPath, packageName)

    readdirSync(packagePath, { withFileTypes: true })
      .filter(dirent => dirent.isFile() && dirent.name.endsWith('.json'))
      .forEach(dirent => {
        const filePath = join(packagePath, dirent.name)
        unlinkSync(filePath)
      })

    rmdirSync(packagePath)
  }
}
