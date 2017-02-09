'use strict'

const Promise = require('bluebird')
const NodeCache = require('node-cache')

class MemoryCache extends NodeCache {
  constructor(cacheSettings) {
    super(cacheSettings || {useClones: false})
  }

  fetch(policy, loadFn, loadFnArgs) {
    if (process.env.NODE_ENV === 'development' && process.env.ADVANCED_CACHE_BYPASS_MEMORY_CACHE === '1') {
      return loadFn(loadFnArgs)
    }

    const value = this.get(policy.key)

    if (!value) {
      return this._loadValue(policy, loadFn, loadFnArgs)
    }

    this._reloadIfExpiring(policy, loadFn, loadFnArgs)

    return Promise.resolve(value)
  }

  _loadValue(policy, loadFn, loadFnArgs) {
    return loadFn.apply(null, loadFnArgs)
      .then(value => {
        this.set(policy.key, value, policy.ttl)
        return value
      })
  }

  _reloadIfExpiring(policy, loadFn, loadFnArgs) {
    if (!policy.reloadBefore) {
      return
    }

    const now = Date.now()
    const ttl = this.getTtl(policy.key)
    const reloadBefore = policy.reloadBefore * 1000

    if (ttl - now < reloadBefore) {
      return this._loadValue(policy, loadFn, loadFnArgs)
    }
  }
}

module.exports = MemoryCache

