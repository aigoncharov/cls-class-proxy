import { createNamespace, getNamespace, Namespace } from 'cls-hooked'

import { CLS_CLASS_PROXY_NAMESPACE_NAME } from './constants'

type IProxifyPropertyDescriptorCache = Map<
  string | symbol | number,
  PropertyDescriptor | undefined
>

const getOrCreateClsNamespace = (namespaceName: string | symbol) => {
  // TODO: Make it accept symbols
  const existingNamesapce = getNamespace(namespaceName as string)
  if (existingNamesapce) {
    return existingNamesapce
  }
  const newNamespace = createNamespace(namespaceName as string)
  return newNamespace
}

const getPropertyDescriptorRecursive = (
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
const makeGetPropertyDescriptorCached = (
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

const makeHandlers = <T extends { new (): any }>(
  clsNamespace: Namespace,
  cache?: IProxifyPropertyDescriptorCache,
): ProxyHandler<T> => {
  let getPropertyDescriptor = getPropertyDescriptorRecursive
  if (cache) {
    getPropertyDescriptor = makeGetPropertyDescriptorCached(cache)
  }
  return {
    construct(target, args) {
      const constructorBound = clsNamespace.bind(target.constructor)
      const instance: T = Reflect.construct(constructorBound, args, target)
      return instance
    },
    get(target, property, receiver) {
      const descriptor = getPropertyDescriptor(target, property)
      if (!descriptor) {
        return undefined
      }
      const getter = descriptor.get
      if (getter) {
        const boundGetter = clsNamespace.bind(getter)
        return Reflect.apply(boundGetter, receiver, [])
      }
      const value = descriptor.value
      if (typeof value === 'function') {
        const boundFn = clsNamespace.bind(value)
        return boundFn
      }
      return Reflect.get(target, property, receiver)
    },
    set(target, property, value, receiver) {
      const descriptor = getPropertyDescriptor(target, property)
      if (!descriptor) {
        return undefined
      }
      const setter = descriptor.set
      if (setter) {
        const boundSetter = clsNamespace.bind(setter)
        return Reflect.apply(boundSetter, receiver, [value])
      }
      return Reflect.set(target, property, value, receiver)
    },
  }
}

export interface IProxifyOptions {
  namespace?: string | symbol
  cache?: boolean
}
export const proxify = ({
  namespace = CLS_CLASS_PROXY_NAMESPACE_NAME,
  cache = true,
}: IProxifyOptions) => <T extends { new (...args: any[]): any }>(
  targetToProxify: T,
) => {
  const clsNamespace = getOrCreateClsNamespace(namespace)
  let propertyDescriptorCache: IProxifyPropertyDescriptorCache | undefined
  if (cache) {
    propertyDescriptorCache = new Map()
  }
  const handlers = makeHandlers(clsNamespace, propertyDescriptorCache)
  const proxifiedTarget = new Proxy(targetToProxify, handlers)
  return proxifiedTarget
}
