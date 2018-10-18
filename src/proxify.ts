import * as clsHooked from 'cls-hooked'

import { CLS_CLASS_PROXY_NAMESPACE_NAME } from './constants'
import { getOrCreateClsNamespace } from './namespace'
import {
  makeGetPropertyDescriptorRecursive,
  IProxifyPropertyDescriptorCache,
  makeGetPropertyDescriptorCached,
} from './property-descriptor'

export const makeHandlers = <T extends { new (): any }>(
  clsNamespace: clsHooked.Namespace,
  cache?: IProxifyPropertyDescriptorCache,
): ProxyHandler<T> => {
  let getPropertyDescriptor = makeGetPropertyDescriptorRecursive
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
