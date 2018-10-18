import { expect } from 'chai'
import { getNamespace, Namespace, reset } from 'cls-hooked'
import { createSandbox } from 'sinon'

import { CLS_CLASS_PROXY_NAMESPACE_NAME } from './constants'
// import { PropertyDescriptorUtils } from './property-descriptor'
import { proxify } from './proxify'

describe(proxify.name, () => {
  const sinon = createSandbox()

  beforeEach(() => sinon.restore())
  beforeEach(() => reset())

  const checkNamespaceIsActive = (
    namespaceName: string | symbol,
  ): Namespace => {
    const namespace = getNamespace(namespaceName as any)
    expect(namespace).not.to.be.equal(undefined)
    expect(namespace.active).not.to.be.deep.equal(undefined)
    expect(namespace.active).to.be.an('object')
    return namespace
  }

  // default should be used for undefined
  const namespaceNames = [undefined, 'TestNamespace', Symbol()]
  const caches = [undefined, true, false]
  for (const namespaceName of namespaceNames) {
    const namespaceNameToGet: any =
      namespaceName || CLS_CLASS_PROXY_NAMESPACE_NAME
    for (const cache of caches) {
      const getterProp = Symbol()
      const getterVal = Symbol()
      const setterProp = Symbol()
      const methodProp = Symbol()
      const methodVal = Symbol()
      class Test {
        private _prop!: symbol
        constructor() {
          checkNamespaceIsActive(namespaceNameToGet)
        }
        public get [getterProp]() {
          checkNamespaceIsActive(namespaceNameToGet)
          return getterVal
        }
        public set [setterProp](val: symbol) {
          checkNamespaceIsActive(namespaceNameToGet)
          this._prop = val
        }
        public get [setterProp]() {
          return this._prop
        }
        public [methodProp]() {
          return methodVal
        }
      }

      let testProxified: Test

      beforeEach(() => {
        const TestProxified = proxify({
          cache,
          namespace: namespaceName,
        })(Test)
        testProxified = new TestProxified()
      })

      describe(`namespace ${
        typeof namespaceName === 'symbol'
          ? namespaceName.toString()
          : namespaceName
      }, cache: ${cache}`, () => {
        it('adds a context to a constructor', () => {
          expect(testProxified).to.be.instanceof(Test)
        })
        it('adds a context to a getter', () => {
          expect(testProxified[getterProp]).to.be.equal(getterVal)
        })
        it('adds a context to a setter', () => {
          const val = Symbol()
          testProxified[setterProp] = val
          expect(testProxified[setterProp]).to.be.equal(val)
        })
        it('adds a context to a method', () => {
          expect(testProxified[methodProp]()).to.be.equal(methodVal)
        })
      })
    }
  }
})
