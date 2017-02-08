'use strict'

const Promise = require('bluebird')
const NodeCache = require('node-cache')

class MemoryCache extends NodeCache {

  constructor(cacheSettings) {
    super(cacheSettings)
  }

  fetch(cachePolicy, loadFn) {
    let value = this.get(cachePolicy.key)

    if (!value) {
      value = loadFn().then(v => v)
      this.set(cachePolicy.key, value, cachePolicy.ttl)
    }

    if (cachePolicy.reloadBefore) {
      this._reload(cachePolicy, loadFn)
    }

    return value
  }

  _reload(cachePolicy, loadFn) {
    const now = Date.now()
    const ttl = this.getTtl(cachePolicy.key)
    const reloadBefore = cachePolicy.reloadBefore * 1000

    if (ttl - now < reloadBefore) {
      this.ttl(cachePolicy.key, cachePolicy.ttl)
      loadFn().then(value => {
        this.set(cachePolicy.key, Promise.resolve(value), cachePolicy.ttl)
      })
    }
  }
}

module.exports = MemoryCache
