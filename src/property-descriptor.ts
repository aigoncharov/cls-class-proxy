export type IProxifyPropertyDescriptorCache = Map<
  string | symbol | number,
  PropertyDescriptor | undefined
>

export const getPropertyDescriptorRecursive = (
  target: object,
  property: string | symbol | number,
): PropertyDescriptor | undefined => {
  const propertyDescriptor = Object.getOwnPropertyDescriptor(target, property)
  if (propertyDescriptor) {
    return propertyDescriptor
  }
  const prototype = Object.getPrototypeOf(target)
  if (prototype) {
    return getPropertyDescriptorRecursive(prototype, property)
  }
  return undefined
}
export const makeGetPropertyDescriptorCached = (
  cache: IProxifyPropertyDescriptorCache,
) => (target: object, property: string | symbol | number) => {
  const cachedDescriptor = cache.get(property)
  if (cachedDescriptor) {
    return cachedDescriptor
  }
  const newDescriptor = getPropertyDescriptorRecursive(target, property)
  cache.set(property, newDescriptor)
  return newDescriptor
}
