export default interface IModuleManifest {
  manifestVersion: number
  botCoreVersion: string
  name: string
  description: string | undefined
  version: string
  author: string | undefined
  authors: string[] | undefined
  nodeDependencies: string[] | undefined
  depend: string[] | undefined
  softDepend: string[] | undefined
  loadBefore: string[] | undefined
}
