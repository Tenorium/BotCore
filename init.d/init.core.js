import Core from '#core';

export default async function (config) {
  const core = new Core(config);
  core.init();
}
