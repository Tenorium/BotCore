// import simpleGit from 'simple-git'
// import ConfigManager from '../data/index.js'
// import { Logger } from 'utilslib'
// import path, { dirname } from 'path'
// import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'
//
// const REMOTE_NAME = 'update'
//
// const migrationsPath = path.join(dirname(new URL('', import.meta.url).pathname), '../migrations')
//
// const runMigration = async function (name: string): Promise<void> {
//   Logger.info(`[AutoUpdate] Migrating ${name}...`)
//   await (await import(path.join(migrationsPath, name))).default()
// }
//
// const execMigrations = async function (): Promise<void> {
//   const migrations = readdirSync(migrationsPath, { withFileTypes: true })
//     .filter(dirent => dirent.isFile())
//     .filter(dirent => dirent.name !== 'migrations.json' && dirent.name !== '.gitignore')
//     .map(dirent => dirent.name)
//     .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
//
//   let executedMigrations: string[]
//
//   if (!existsSync(path.join(migrationsPath, 'migrations.json'))) {
//     executedMigrations = []
//   } else {
//     executedMigrations = JSON.parse(readFileSync(path.join(migrationsPath, 'migrations.json')).toString())
//   }
//
//   for (const migration of migrations) {
//     if (executedMigrations.includes(migration)) {
//       continue
//     }
//
//     await runMigration(migration)
//     executedMigrations.push(migration)
//   }
//
//   writeFileSync(path.join(migrationsPath, 'migrations.json'), JSON.stringify(executedMigrations))
// }
//
// export default async function (): Promise<void> {
//   if (ConfigManager.readConfig('updater') === null) {
//     ConfigManager.writeConfig('updater',
//       {
//         autoupdate: false,
//         repo: 'https://github.com/Tenorium/BotCore.git',
//         branch: 'master'
//       })
//   }
//
//   if (!ConfigManager.readConfig('updater').autoupdate) {
//     return
//   }
//
//   Logger.info('[AutoUpdate] Pulling remote repo...')
//
//   const git = simpleGit(global.basePath)
//   let updaterConfig = ConfigManager.readConfig('updater')
//
//   if (updaterConfig === null) {
//     updaterConfig = {
//       autoupdate: true,
//       repo: 'https://github.com/Tenorium/BotCore.git',
//       branch: 'master'
//     }
//
//     ConfigManager.writeConfig('updater', updaterConfig)
//   }
//
//   const remotes = (await git.raw('remote')).split('\n')
//
//   if (remotes.includes(REMOTE_NAME)) {
//     await git.removeRemote('update')
//   }
//
//   await git.init()
//     .addConfig('user.name', 'BotCore update system')
//     .addConfig('user.email', 'update@example.com')
//     .addRemote(REMOTE_NAME, updaterConfig.repo)
//     .fetch(REMOTE_NAME)
//     .stash()
//     .checkout(`${updaterConfig.branch}`, ['--force'])
//     .pull('update', 'master')
//     .raw('stash', 'pop')
//
//   Logger.info('[AutoUpdate] Update finished')
//
//   Logger.info('[AutoUpdate] Executing migrations...')
//
//   await execMigrations()
// }

export default async function (): Promise<void> {

}
