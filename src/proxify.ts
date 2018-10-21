import * as clsHooked from 'cls-hooked'

import { CLS_CLASS_PROXY_NAMESPACE_NAME } from './constants'
import { getOrCreateClsNamespace } from './namespace'
import {
  IProxifyPropertyDescriptorCache,
  PropertyDescriptorUtils,
} from './property-descriptor'

export class HandlerManager {
  public static makeHandlers<T extends object>(
    clsNamespace: clsHooked.Namespace,
    cache?: IProxifyPropertyDescriptorCache,
  ): ProxyHandler<new (...args: any[]) => T> {
    return {
      construct(target, args) {
        return clsNamespace.runAndReturn(() => {
          const instance = new target(...args)
          return new Proxy(
            instance,
            HandlerManager._makeInstanceHandlers(clsNamespace, cache),
          )
        })
      },
    }
  }
  private static _makeInstanceHandlers<T extends object>(
    clsNamespace: clsHooked.Namespace,
    cache?: IProxifyPropertyDescriptorCache,
  ): ProxyHandler<T> {
    let getPropertyDescriptor: (
      target: T,
      property: string | number | symbol,
    ) => PropertyDescriptor | undefined = (...args) =>
      PropertyDescriptorUtils.getPropertyDescriptorRecursive(...args)
    if (cache) {
      getPropertyDescriptor = (...args) =>
        PropertyDescriptorUtils.getPropertyDescriptorCached(cache, ...args)
    }
    return {
      get(target, property, receiver) {
        const descriptor = getPropertyDescriptor(target, property)
        if (descriptor) {
          const getter = descriptor.get
          if (getter) {
            return clsNamespace.runAndReturn(() =>
              Reflect.get(target, property, receiver),
            )
          }
          const value = descriptor.value
          if (typeof value === 'function') {
            const boundFn = clsNamespace.bind(value)
            return boundFn
          }
        }
        return Reflect.get(target, property, receiver)
      },
      set(target, property, value, receiver) {
        const descriptor = getPropertyDescriptor(target, property)
        if (descriptor && descriptor.set) {
          return clsNamespace.runAndReturn(() =>
            Reflect.set(target, property, value, receiver),
          )
        }
        return Reflect.set(target, property, value, receiver)
      },
    }
  }
}

export interface IProxifyOptions {
  namespace?: string
  cache?: boolean
}
export const proxify = ({
  namespace = CLS_CLASS_PROXY_NAMESPACE_NAME,
  cache = true,
}: IProxifyOptions = {}) => <T extends object>(
  targetToProxify: new (...args: any[]) => T,
): new (...args: any[]) => T => {
  const clsNamespace = getOrCreateClsNamespace(namespace)
  let propertyDescriptorCache: IProxifyPropertyDescriptorCache | undefined
  if (cache) {
    propertyDescriptorCache = new Map()
  }
  const handlers = HandlerManager.makeHandlers<T>(
    clsNamespace,
    propertyDescriptorCache,
  )
  const proxifiedTarget = new Proxy(targetToProxify, handlers)
  return proxifiedTarget
}
