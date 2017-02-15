'use strict'

const NodeCache = require('node-cache')

class MemoryCache extends NodeCache {
  constructor(opts) {
    const defaultOpts = {useClones: false}
    opts = Object.assign(defaultOpts, opts)
    super(opts)
  }

  fetch(cachePolicy, loadFn, loadFnArgs) {
    const _loadFn = loadFnArgs ? loadFn.bind(null, ...loadFnArgs) : loadFn
    if (process.env.NODE_ENV === 'development' && process.env.ADVANCED_CACHE_BYPASS_MEMORY_CACHE === '1') {
      return _loadFn()
    }

    let value = this.get(cachePolicy.key)

    if (!value) {
      value = this._getValue(_loadFn, cachePolicy)
    }

    if (cachePolicy.reloadBefore) {
      this._reloadIfExpiring(cachePolicy, _loadFn)
    }

    return value
  }

  _getValue(loader, cachePolicy) {
    const value = loader().then(v => v)
    this.set(cachePolicy.key, value, cachePolicy.ttl)
    return value
  }

  _reloadIfExpiring(cachePolicy, _loadFn) {
    if (!cachePolicy.reloadBefore) {
      return
    }

    const now = Date.now()
    const ttl = this.getTtl(cachePolicy.key)
    const reloadBefore = cachePolicy.reloadBefore * 1000

    if (ttl - now < reloadBefore) {
      return this._getValue(_loadFn, cachePolicy)
    }
  }
}

module.exports = MemoryCache
