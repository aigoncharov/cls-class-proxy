import * as clsHooked from 'cls-hooked'

export const getOrCreateClsNamespace = (namespaceName: string) => {
  const existingNamesapce = clsHooked.getNamespace(namespaceName)
  if (existingNamesapce) {
    return existingNamesapce
  }
  const newNamespace = clsHooked.createNamespace(namespaceName)
  return newNamespace
}
