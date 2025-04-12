export const listSubCommand = (): void => {
  const ModuleManager = app('ModuleManager')

  console.log(ModuleManager.listModules())
}
