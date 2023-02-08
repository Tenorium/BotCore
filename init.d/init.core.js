import Core from '../core/core.js'

export default async function (config) {
  const core = new Core(config)
  global.core = core
  core.init()
}
