import Core from "../core/core.js";

export default async function (config) {
    let core = new Core(config);
    global.core = core;
    core.init();
}