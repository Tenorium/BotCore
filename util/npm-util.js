import {spawn} from 'child_process';

const command = 'npm';

function isValidGitUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'git:';
}

/**
 * Install packages
 * @param {Object<string, string>} packages
 * @return {Promise<unknown>}
 */
export const install = function (packages) {
    const args = ['install'];

    Object.keys(packages).forEach(packageName => {
        if (!packages[packageName]) {
            args.push(packageName);
            return;
        }

        if (isValidGitUrl(packages[packageName])) {
            args.push(packages[packageName]);
            return;
        }

        args.push(`${packageName}@${packages[packageName]}`);
    })

    return runNpmCommand(command, args);
}

export const listInstalled = async function () {
    const {dependencies} = JSON.parse(await runNpmCommand(command, ['list', '--json', '--depth=0'], false));
    let packages = {};

    Object.keys(dependencies).forEach(value => {
        packages[value] = dependencies[value].version;
    });

    return packages;
}

/**
 *
 * @param {string} command
 * @param {string[]} args
 * @param {?boolean} printStdOut
 * @return {Promise<unknown>}
 */
const runNpmCommand = function (command, args, printStdOut = true) {
    return new Promise((resolve, reject) => {
        let buffer = '';

        const npmProcess = spawn(command, args, {
            cwd: global.basePath
        });
        npmProcess.stdout.setEncoding('utf-8');
        npmProcess.stdout.on('data', function (data) {
            buffer += data;
            if (printStdOut) {
                console.log(data);
            }
        });

        npmProcess.stderr.setEncoding('utf-8');
        npmProcess.stderr.on('data', function (data) {
            console.error(data);
        })

        npmProcess.on('close', code => {
            if (code !== 0) {
                reject();
            }
            resolve(buffer);
        });
    });
}

/**
 * @typedef PackageRecord
 * @type Object
 * @property {string} name
 * @property {string} version
 */
