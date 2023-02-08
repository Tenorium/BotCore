import { spawn } from 'child_process'

function isValidGitUrl (string) {
  let url

  try {
    url = new URL(string)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'git:'
}

/**
 * Install packages
 * @param {Object<string, string>} packages
 * @return {Promise<unknown>}
 */
export const install = function (packages) {
  const command = 'npm'
  const args = ['install']

  Object.keys(packages).forEach(packageName => {
    if (!packages[packageName]) {
      args.push(packageName)
      return
    }

    if (isValidGitUrl(packages[packageName])) {
      args.push(packages[packageName])
      return
    }

    args.push(`${packageName}@${packages[packageName]}`)
  })

  return runNpmCommand(command, args)
}

/**
 *
 * @param {string} command
 * @param {string[]} args
 * @return {Promise<unknown>}
 */
const runNpmCommand = function (command, args) {
  return new Promise((resolve, reject) => {
    const npmProcess = spawn(command, args, {
      cwd: basePath
    })
    npmProcess.stdout.setEncoding('utf-8')
    npmProcess.stdout.on('data', function (data) {
      console.log(data)
    })

    npmProcess.stderr.setEncoding('utf-8')
    npmProcess.stderr.on('data', function (data) {
      console.error(data)
    })

    npmProcess.on('close', code => {
      if (code !== 0) {
        reject()
      }
      resolve()
    })
  })
}

/**
 * @typedef PackageRecord
 * @type Object
 * @property {string} name
 * @property {string} version
 */
