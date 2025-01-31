import DependencyInstaller, { DependencyCacheDataObject } from '@tenorium/utilslib/build/npm/dependencyInstaller.js'

const dependencyCache = new DependencyCacheDataObject()

const depInstaller = new DependencyInstaller(dependencyCache)

await depInstaller.getPluginManager().install('discord.js', '13.6.0')
const discordjs = depInstaller.getPluginManager().require('discord.js')

console.log(discordjs)
