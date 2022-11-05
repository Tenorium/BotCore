import simpleGit from "simple-git";
import ConfigManager from "../data/index.js";
import Logger from "../util/log.js";
import path, {dirname} from "path";
import {existsSync, readdirSync, readFileSync, writeFileSync} from "fs";

const migrationsPath = path.join(dirname(new URL('', import.meta.url).pathname), '../migrations')

const runMigration = async function (name) {
    Logger.info(`[AutoUpdate] Migrating ${name}...`);
    await (await import(path.join(migrationsPath, name))).default();
}

const execMigrations = async function () {
    let migrations = readdirSync(migrationsPath, {withFileTypes: true})
        .filter(dirent => dirent.isFile())
        .filter(dirent => dirent.name !== 'migrations.json' || dirent.name !== '.gitignore')
        .map(dirent => dirent.name)
        .sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}));

    let executedMigrations;

    if (!existsSync(path.join(migrationsPath, 'migrations.json'))) {
        executedMigrations = [];
    } else {
        executedMigrations = JSON.parse(readFileSync(path.join(migrationsPath, 'migrations.json')).toString());
    }

    for (const migration of migrations) {
        if (executedMigrations.contains(migration)) {
            continue;
        }

        await runMigration(migration);
        executedMigrations.push(migration);
    }

    writeFileSync(path.join(migrationsPath, 'migrations.json'), JSON.stringify(executedMigrations));
}

export default async function () {
    Logger.info('[AutoUpdate] Pulling remote repo...')

    const git = simpleGit(basePath);
    let updaterConfig = ConfigManager.readConfig('updater');

    if (updaterConfig === null) {
        updaterConfig = {
            autoupdate: true,
            repo: 'https://github.com/Tenorium/BotCore.git',
            branch: 'master'
        };

        ConfigManager.writeConfig('updater', undefined, updaterConfig);
    }

    await git.init()
        .addRemote('origin', updaterConfig.repo)
        .fetch()
        .checkout(`origin/${updaterConfig.branch}`, ['--force'])
        .raw('restore .');

    Logger.info('[AutoUpdate] Update finished');

    Logger.info('[AutoUpdate] Executing migrations...');

    await execMigrations();
}