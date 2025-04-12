import fs from "fs";
import semver from "semver";
import {Logger} from "@tenorium/utilslib";
import {spawnSync} from "child_process";

const { engines } = JSON.parse(fs.readFileSync('./package.json').toString())

const version = engines.node;

if (typeof version !== 'string') {
    throw new Error("Missing engines.node in package.json")
}

if (!semver.satisfies(process.version, version)) {
    Logger.fatal(`Required node version ${version} not satisfied with current version ${process.version}.`)
    process.exit(1);
}

const args = process.argv.slice(2);

spawnSync('node', ['build/dist/botcore.mjs', ...args], {stdio: "inherit"});