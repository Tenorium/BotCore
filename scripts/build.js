import * as esbuild from 'esbuild'
import { execSync, spawnSync } from 'child_process'
import { Logger } from '@tenorium/utilslib'

execSync('npm run clean')

Logger.info('Compiling TypeScript...')

const result = spawnSync('npx', 'tsc --build --verbose'.split(' '), { stdio: 'inherit' })

if (result.status !== 0) {
  process.exit(result.status)
}

Logger.info('Bundling JS files...')

await esbuild.build({
  entryPoints: ['build/tsc/botcore.js'],
  bundle: true,
  outbase: 'build/tsc',
  outdir: 'build/dist',
  outExtension: { '.js': '.mjs' },
  platform: 'node',
  format: 'esm',
  external: [
    'readline/promises',
    'colors',
    'discord.js',
    'wtfnode',
    'i18n'
  ],
  logLevel: 'info'
})
