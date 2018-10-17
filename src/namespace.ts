import * as clsHooked from 'cls-hooked'

export const getOrCreateClsNamespace = (namespaceName: string | symbol) => {
  // TODO: Make it accept symbols
  const existingNamesapce = clsHooked.getNamespace(namespaceName as string)
  if (existingNamesapce) {
    return existingNamesapce
  }
  const newNamespace = clsHooked.createNamespace(namespaceName as string)
  return newNamespace
}
