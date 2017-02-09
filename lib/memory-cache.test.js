'use strict'

require('should')

const Promise = require('bluebird')
const MemoryCache = require('./memory-cache')
const CachePolicy = require('./cache-policy')

const memoryCache = new MemoryCache()
const cachePolicy = new CachePolicy(['test'], 24 * 60 * 60, 24 * 60 * 60 - 1 / 10)

describe('MemoryCache', () => {
  it('arguments test', () => {
    memoryCache.flushAll()
    const test1 = {test1: 'test1'}
    return memoryCache.fetch(cachePolicy, loadFn, [test1])
      .then(value => {
        value.should.deepEqual(test1)
      })
  })

  it('should return data from cache if cache data exists', () => {
    memoryCache.flushAll()
    const test1 = {test1: 'test1'}
    const test2 = {test2: 'test2'}
    return memoryCache.fetch(cachePolicy, loadFn, [test1])
      .then(() => {
        return memoryCache.fetch(cachePolicy, loadFn, [test2])
      }).then(value => {
        value.should.deepEqual(test1)
      })
  })

  it('should reload data if cache expired', () => {
    memoryCache.flushAll()
    const test1 = {test1: 'test1'}
    const test2 = {test2: 'test2'}
    return memoryCache.fetch(cachePolicy, loadFn, [test1])
      .then(() => {
        memoryCache.ttl(cachePolicy.key, -1)
        return memoryCache.fetch(cachePolicy, loadFn, [test2])
      })
      .then(value => {
        value.should.deepEqual(test2)
      })
  })

  it('should reload data if cache expiring', () => {
    memoryCache.flushAll()
    const test1 = {test1: 'test1'}
    const test2 = {test2: 'test2'}
    return memoryCache.fetch(cachePolicy, loadFn, [test1]) //put data to cache
      .then(() => {
        return Promise.delay(101) //wait till reloadBefore
      })
      .then(() => {
        return memoryCache.fetch(cachePolicy, loadFn, [test2])  //will trigger reloadBefore
      })
      .then(() => {
        return Promise.delay(2) //wait till loadFn will finish execution in reloadBefore
      })
      .then(() => {
        return memoryCache.fetch(cachePolicy, loadFn, [test1]) //call cache again
      })
      .then(value => {
        value.should.deepEqual(test2) //should return data loaded which loaded with triggered reloadBefore
      })
  })
})

function loadFn(test) {
  return Promise.delay(1).then(() => {
    return Promise.resolve(test)
  })
}
