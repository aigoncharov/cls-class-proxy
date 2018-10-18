import { expect } from 'chai'
import { createSandbox } from 'sinon'

import {
  IProxifyPropertyDescriptorCache,
  PropertyDescriptorUtils,
} from './property-descriptor'

describe(PropertyDescriptorUtils.constructor.name, () => {
  const sinon = createSandbox()

  beforeEach(() => sinon.restore())

  const checkIsPropertyDescriptor = (target: any): PropertyDescriptor => {
    expect(target).not.to.be.equal(undefined)
    expect(target).to.be.an('object')
    expect(target).to.have.property('configurable')
    expect(target).to.have.property('enumerable')
    expect(target).to.have.property('value')
    expect(target).to.have.property('writable')
    return target
  }

  describe(PropertyDescriptorUtils.getPropertyDescriptorRecursive.name, () => {
    const props = ['testProp', Symbol()]
    for (const prop of props) {
      it(`gets own property descriptor: ${typeof prop}`, () => {
        const val = 'testVal'
        const obj = { [prop]: val }
        const descriptor = PropertyDescriptorUtils.getPropertyDescriptorRecursive(
          obj,
          prop,
        )
        checkIsPropertyDescriptor(descriptor)
        expect(descriptor!.value).to.be.equal(val)
      })
      it(`gets inherited property descriptor: ${typeof prop}`, () => {
        const val = 'testVal'
        const parent = { [prop]: val }
        const child = {}
        Object.setPrototypeOf(child, parent)
        const descriptor = PropertyDescriptorUtils.getPropertyDescriptorRecursive(
          child,
          prop,
        )
        checkIsPropertyDescriptor(descriptor)
        expect(descriptor!.value).to.be.equal(val)
      })
      it(`own property descriptor overrides inherited one: ${typeof prop}`, () => {
        const valParent = 'testValParent'
        const valChild = 'testValChild'
        const parent = { [prop]: valParent }
        const child = { [prop]: valChild }
        Object.setPrototypeOf(child, parent)
        const descriptor = PropertyDescriptorUtils.getPropertyDescriptorRecursive(
          child,
          prop,
        )
        checkIsPropertyDescriptor(descriptor)
        expect(descriptor!.value).to.be.equal(valChild)
      })
    }
    it('returns undefined if a property descriptor is not found', () => {
      const obj = {}
      const descriptor = PropertyDescriptorUtils.getPropertyDescriptorRecursive(
        obj,
        Symbol(),
      )
      expect(descriptor).to.be.equal(undefined)
    })
  })

  describe(PropertyDescriptorUtils.makeGetPropertyDescriptorCached.name, () => {
    let cache: IProxifyPropertyDescriptorCache
    let getPropertyDescriptorCached: (
      target: object,
      property: string | symbol | number,
    ) => PropertyDescriptor | undefined
    beforeEach(() => {
      cache = new Map()
      getPropertyDescriptorCached = PropertyDescriptorUtils.makeGetPropertyDescriptorCached(
        cache,
      )
    })
    const props = ['testProp', Symbol()]
    for (const prop of props) {
      it(`adds a property descriptor to a cache: ${typeof prop}`, () => {
        const val = 'testVal'
        const obj = { [prop]: val }
        expect(cache.size).to.be.equal(0)
        const descriptorCandidate = getPropertyDescriptorCached(obj, prop)
        const descriptor = checkIsPropertyDescriptor(descriptorCandidate)
        expect(descriptor.value).to.be.equal(val)
        expect(cache.size).to.be.equal(1)
        expect(cache.get(prop)).to.be.equal(descriptor)
      })
      it(`gets a property descriptor from a cache: ${typeof prop}`, () => {
        const val = 'testVal'
        const obj = { [prop]: val }
        expect(cache.size).to.be.equal(0)
        const spyGetProprtyDescriptorRecursive = sinon.spy(
          PropertyDescriptorUtils,
          'getPropertyDescriptorRecursive',
        )
        const spyMapSet = sinon.spy(Map.prototype, 'set')
        getPropertyDescriptorCached(obj, prop)
        expect(spyGetProprtyDescriptorRecursive.callCount).to.be.equal(1)
        expect(spyMapSet.callCount).to.be.equal(1)
        const descriptorCandidate = getPropertyDescriptorCached(obj, prop)
        // Check getPropertyDescriptorRecursive was not called and we got the descriptor from the cache
        expect(spyGetProprtyDescriptorRecursive.callCount).to.be.equal(1)
        expect(spyMapSet.callCount).to.be.equal(1)
        const descriptor = checkIsPropertyDescriptor(descriptorCandidate)
        expect(descriptor.value).to.be.equal(val)
        expect(cache.size).to.be.equal(1)
        expect(cache.get(prop)).to.be.equal(descriptor)
      })
    }
  })
})
