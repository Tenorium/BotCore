export const reloadSubCommand = (moduleName: string): void => {
  const ModuleManager = app('ModuleManager')
  if (!ModuleManager.listLoadedModules().includes(moduleName)) {
    console.log(`Module ${moduleName} is not loaded`)
    return
  }

  if (!ModuleManager.listModules().includes(moduleName)) {
    console.log(`Module ${moduleName} does not exist`)
    return
  }

  ModuleManager.unload(moduleName)
  void ModuleManager.load(moduleName).then(() => {
    console.log(`Module ${moduleName} reloaded`)
  })
}
