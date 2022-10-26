import {spawn} from "child_process";

function isValidGitUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "git:";
}

/**
 * Install packages
 * @param {PackageRecord[]} packages
 * @return {Promise<unknown>}
 */
export const install = function (packages) {
    let command = 'npm';
    let args = ['install']
    packages.forEach(packageObject => {
        if (!packageObject.version) {
            args.push(packageObject.name);
            return;
        }

        if (isValidGitUrl(packageObject.version)) {
            args.push(packageObject.version);
        }

        args.push(`${packageObject.name}@${packageObject.version}`);
    });

    return runNpmCommand(command, args);
}

/**
 *
 * @param {PackageRecord[]} packages
 */
export const uninstall = function (packages) {
    let command = 'npm';
    let args = ['uninstall']
    packages.forEach(packageObject => {
        args.push(`${packageObject.name}@${packageObject.version}`)
    });

    return runNpmCommand(command, args);
}

/**
 *
 * @param {string} command
 * @param {string[]} args
 * @return {Promise<unknown>}
 */
const runNpmCommand = function (command, args) {
    return new Promise((resolve, reject) => {
        let npmProcess = spawn(command, args, {
            cwd: basePath
        });
        npmProcess.stdout.setEncoding('utf-8');
        npmProcess.stdout.on('data', function (data) {
            console.log(data);
        });

        npmProcess.stderr.setEncoding('utf-8');
        npmProcess.stderr.on('data', function (data) {
            console.error(data);
        });

        npmProcess.on('close', code => {
            if (code !== 0) {
                reject();
            }
            resolve();
        });
    })
}

/**
 * @typedef PackageRecord
 * @type Object
 * @property {string} name
 * @property {string} version
 */