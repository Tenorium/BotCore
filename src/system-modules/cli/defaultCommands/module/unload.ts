export const unloadSubCommand = (moduleName: string): void => {
  const ModuleManager = app('ModuleManager')
  if (!ModuleManager.listLoadedModules().includes(moduleName)) {
    console.log(`Module ${moduleName} is not loaded`)
    return
  }

  ModuleManager.unload(moduleName)

  console.log(`Module ${moduleName} unloaded`)
}
