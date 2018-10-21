import { expect } from 'chai'
import { getNamespace, Namespace, reset } from 'cls-hooked'
import { createSandbox, SinonSpy } from 'sinon'

import { CLS_CLASS_PROXY_NAMESPACE_NAME } from './constants'
import { PropertyDescriptorUtils } from './property-descriptor'
import { proxify } from './proxify'

describe.only('proxify', () => {
  const sinon = createSandbox()

  afterEach(() => sinon.restore())
  afterEach(() => reset())

  const checkNamespaceIsActive = (
    namespaceName: string | symbol,
  ): Namespace => {
    const namespace = getNamespace(namespaceName)
    expect(namespace).not.to.be.equal(undefined)
    expect(namespace.active).not.to.be.deep.equal(undefined)
    expect(namespace.active).to.be.an('object')
    return namespace
  }

  // default should be used for undefined
  const namespaceNames = [undefined, 'TestNamespace']
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

      describe(`namespace ${namespaceName}, cache: ${cache}`, () => {
        let testProxified: Test
        let spyGetPropertyDescriptor: SinonSpy

        beforeEach(() => {
          const TestProxified = proxify({
            cache,
            namespace: namespaceName,
          })(Test)
          testProxified = new TestProxified()
        })
        beforeEach(() => {
          spyGetPropertyDescriptor = sinon.spy(
            PropertyDescriptorUtils,
            'getPropertyDescriptorCached',
          )
          if (cache === false) {
            spyGetPropertyDescriptor = sinon.spy(
              PropertyDescriptorUtils,
              'getPropertyDescriptorRecursive',
            )
          }
        })

        it('adds a context to a constructor', () => {
          expect(testProxified).to.be.instanceof(Test)
        })
        it('adds a context to a getter', () => {
          expect(spyGetPropertyDescriptor.called).to.be.equal(false)
          expect(testProxified[getterProp]).to.be.equal(getterVal)
          expect(spyGetPropertyDescriptor.called).to.be.equal(true)
        })
        it('adds a context to a setter', () => {
          const val = Symbol()
          expect(spyGetPropertyDescriptor.called).to.be.equal(false)
          testProxified[setterProp] = val
          expect(spyGetPropertyDescriptor.called).to.be.equal(true)
          expect(testProxified[setterProp]).to.be.equal(val)
        })
        it('adds a context to a method', () => {
          expect(spyGetPropertyDescriptor.called).to.be.equal(false)
          expect(testProxified[methodProp]()).to.be.equal(methodVal)
          expect(spyGetPropertyDescriptor.called).to.be.equal(true)
        })
        it("doesn't fail for an unknown getter", () => {
          expect((testProxified as any)[Symbol()]).to.be.equal(undefined)
        })
        it("doesn't fail for an unknown setter", () => {
          const prop = Symbol()
          const val = Symbol()
          const textProxifiedAny = testProxified as any
          textProxifiedAny[prop] = val
          expect(textProxifiedAny[prop]).to.be.equal(val)
        })
      })
    }
  }
})
