export const enableSubCommand = (moduleName: string): void => {
  const ModuleManager = app('ModuleManager')

  if (!ModuleManager.listModules().includes(moduleName)) {
    console.log(`Module ${moduleName} does not exist`)
    return
  }

  if (!ModuleManager.getDisabledModules().includes(moduleName)) {
    console.log(`Module ${moduleName} is already enabled`)
    return
  }

  ModuleManager.enable(moduleName)

  console.log(`Module ${moduleName} enabled`)
}
