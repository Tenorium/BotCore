export const loadSubCommand = (moduleName: string): void => {
  const ModuleManager = app('ModuleManager')
  if (ModuleManager.listLoadedModules().includes(moduleName)) {
    console.log(`Module ${moduleName} is already loaded`)
    return
  }

  if (!ModuleManager.listModules().includes(moduleName)) {
    console.log(`Module ${moduleName} does not exist`)
    return
  }

  void ModuleManager.load(moduleName).then(() => {
    console.log(`Module ${moduleName} loaded`)
  })
}
