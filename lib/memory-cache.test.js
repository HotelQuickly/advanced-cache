'use strict'

require('should')
require('should-sinon')

const sinon = require('sinon')
const Promise = require('bluebird')
const MemoryCache = require('./memory-cache')

const memoryCache = new MemoryCache()

describe('MemoryCache', () => {
  beforeEach(() => {
    memoryCache.flushAll()
  })

  describe('when first call and object is not in cache', () => {
    it('should call loadFn', () => {
      const policy = {key: 'osidcns2', ttl: 120}
      const loadFn = sinon.stub().returns(Promise.resolve({}))
      memoryCache.fetch(policy, loadFn)
      loadFn.should.be.calledOnce()
    })

    it('should resolve with correct value', () => {
      const value = {a: 'a'}
      const policy = {key: 'odkjf', ttl: 120}
      const loadFn = sinon.stub().returns(Promise.resolve(value))
      return memoryCache.fetch(policy, loadFn).then(cached => cached.should.be.equal(value))
    })
  })

  describe('when value for key was already requested', () => {
    it('should return the same promise for the second call as for the first call', () => {
      const policy = {key: 'vkcv9s', ttl: 120}
      const loadFn = sinon.stub().returns(Promise.resolve({}))
      const firstPromise = memoryCache.fetch(policy, loadFn)
      const secondPromise = memoryCache.fetch(policy, loadFn)
      secondPromise.should.be.equal(firstPromise)
    })
  })

  describe('when reload before is used', () => {
    it('should call loadFn when fetch at time when expires is less then reloadBefore', () => {
      const policy = {key: 'asix22', ttl: 0.2, reloadBefore: 0.1}
      const loadFn = sinon.stub().returns(Promise.resolve({}))
      const firstPromise = memoryCache.fetch(policy, loadFn)
      return Promise.delay(150)
        .then(() => {
          const secondPromise = memoryCache.fetch(policy, loadFn)
          loadFn.should.be.calledTwice()
          secondPromise.should.be.equal(firstPromise)
        })
    })

    it('should not call loadFn when somebody already initiates reload', () => {
      const policy = {key: 'asix22', ttl: 0.2, reloadBefore: 0.1}
      const loadFn = sinon.stub().returns(Promise.resolve({test: '123'}))
      const firstPromise = memoryCache.fetch(policy, loadFn)
      return Promise.delay(150)
        .then(() => {
          memoryCache.fetch(policy, loadFn)
          const promise = memoryCache.fetch(policy, loadFn)
          loadFn.should.be.calledTwice()
          Promise.all([
            promise,
            firstPromise
          ]).spread((a, b) => {
            a.should.be.equal(b)
          })

        })
    })

    it('should return correct object once reloaded', () => {
      const expected = {}
      const policy = {key: 'asix22', ttl: 0.2, reloadBefore: 0.1}
      const loadFn = sinon.stub().returns(Promise.resolve(expected))
      const firstPromise = memoryCache.fetch(policy, loadFn)
      return Promise.delay(150)
        .then(() => {
          memoryCache.fetch(policy, loadFn)
          return Promise.delay(50)
        })
        .then(() => {
          const promise = memoryCache.fetch(policy, loadFn)
          promise.should.not.equal(firstPromise)
          return promise.then(value => value.should.equal(expected))
        })
    })
  })
})
