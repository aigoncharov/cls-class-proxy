export type IProxifyPropertyDescriptorCache = Map<
  string | symbol | number,
  PropertyDescriptor | undefined
>
export class PropertyDescriptorUtils {
  public static getPropertyDescriptorRecursive(
    target: object,
    property: string | symbol | number,
  ): PropertyDescriptor | undefined {
    const propertyDescriptor = Object.getOwnPropertyDescriptor(target, property)
    if (propertyDescriptor) {
      return propertyDescriptor
    }
    const prototype = Object.getPrototypeOf(target)
    if (prototype) {
      return this.getPropertyDescriptorRecursive(prototype, property)
    }
    return undefined
  }

  public static makeGetPropertyDescriptorCached(
    cache: IProxifyPropertyDescriptorCache,
  ) {
    return (
      target: object,
      property: string | symbol | number,
    ): PropertyDescriptor | undefined => {
      const cachedDescriptor = cache.get(property)
      if (cachedDescriptor) {
        return cachedDescriptor
      }
      const newDescriptor = this.getPropertyDescriptorRecursive(
        target,
        property,
      )
      cache.set(property, newDescriptor)
      return newDescriptor
    }
  }
}
