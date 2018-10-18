import { expect } from 'chai'

import {
  makeGetPropertyDescriptorRecursive,
  IProxifyPropertyDescriptorCache,
  makeGetPropertyDescriptorCached,
} from './property-descriptor'

describe('property-descriptor', () => {
  const checkIsPropertyDescriptor = (target: any) => {
    expect(target).not.to.be.equal(undefined)
    expect(target).to.be.an('object')
    expect(target).to.have.property('configurable')
    expect(target).to.have.property('enumerable')
    expect(target).to.have.property('value')
    expect(target).to.have.property('writable')
  }

  describe(makeGetPropertyDescriptorRecursive.name, () => {
    const props = ['testProp', Symbol()]
    for (const prop of props) {
      it(`gets own property descriptor: ${typeof prop}`, () => {
        const val = 'testVal'
        const obj = { [prop]: val }
        const descriptor = makeGetPropertyDescriptorRecursive(obj, prop)
        checkIsPropertyDescriptor(descriptor)
        expect(descriptor!.value).to.be.equal(val)
      })
      it(`gets inherited property descriptor: ${typeof prop}`, () => {
        const val = 'testVal'
        const parent = { [prop]: val }
        const child = {}
        Object.setPrototypeOf(child, parent)
        const descriptor = makeGetPropertyDescriptorRecursive(child, prop)
        checkIsPropertyDescriptor(descriptor)
        expect(descriptor!.value).to.be.equal(val)
      })
      it(`own property descriptor overrides inherited one: ${typeof prop}`, () => {
        const valParent = 'testValParent'
        const valChild = 'testValChild'
        const parent = { [prop]: valParent }
        const child = { [prop]: valChild }
        Object.setPrototypeOf(child, parent)
        const descriptor = makeGetPropertyDescriptorRecursive(child, prop)
        checkIsPropertyDescriptor(descriptor)
        expect(descriptor!.value).to.be.equal(valChild)
      })
    }
    it('returns undefined if a property descriptor is not found', () => {
      const obj = {}
      const descriptor = makeGetPropertyDescriptorRecursive(obj, Symbol())
      expect(descriptor).to.be.equal(undefined)
    })
  })

  describe(makeGetPropertyDescriptorCached.name, () => {
    let cache!: IProxifyPropertyDescriptorCache
    let getPropertyDescriptorCached!: (
      target: object,
      property: string | symbol | number,
    ) => PropertyDescriptor
    before(() => {
      cache = new Map()
      getPropertyDescriptorCached = makeGetPropertyDescriptorCached(cache)
    })
    it('adds a property descriptor to a cache', () => {
      const prop = 'testProp'
      const val = 'testVal'
      const obj = { [prop]: val }
      expect(cache.size).to.be.equal(0)
      const descriptor = getPropertyDescriptorCached(obj, prop)
      checkIsPropertyDescriptor(descriptor)
      expect(descriptor.value).to.be.equal(val)
      expect(cache.size).to.be.equal(1)
      expect(cache.get(prop))
    })
  })
})
