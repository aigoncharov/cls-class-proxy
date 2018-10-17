import { expect } from 'chai'
import * as clsHooked from 'cls-hooked'
import { createSandbox } from 'sinon'

import { getOrCreateClsNamespace } from './namespace'

describe('namespace', () => {
  const sinon = createSandbox()

  beforeEach(() => sinon.restore())

  describe('getOrCreateClsNamespace', () => {
    it('creates a new namespace', () => {
      const namespaceName = Symbol()
      const spyCreateNamespace = sinon.spy(clsHooked, 'createNamespace')
      const namespace: clsHooked.Namespace = getOrCreateClsNamespace(
        namespaceName,
      )
      expect(spyCreateNamespace.callCount).to.be.equal(1)
      expect(namespace).not.to.be.equal(undefined)
      expect(namespace).to.have.property('name', namespaceName)
    })
    it('retrieves an existing namespace', () => {
      const namespaceName = Symbol()
      getOrCreateClsNamespace(namespaceName)
      const spyCreateNamespace = sinon.spy(clsHooked, 'createNamespace')
      const namespace = getOrCreateClsNamespace(namespaceName)
      expect(spyCreateNamespace.callCount).to.be.equal(0)
      expect(namespace).not.to.be.equal(undefined)
      expect(namespace).to.have.property('name', namespaceName)
    })
  })
})
