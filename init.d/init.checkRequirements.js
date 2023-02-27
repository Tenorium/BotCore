import semver from "semver";
import fs from "fs";
import {dirname} from "path";

global.basePath = dirname(new URL('../', import.meta.url).pathname);

let { engines } = JSON.parse(fs.readFileSync('./package.json'));

const version = engines.node;
if (!semver.satisfies(process.version, version)) {
    console.log(`Required node version ${version} not satisfied with current version ${process.version}.`);
    process.exit(1);
}