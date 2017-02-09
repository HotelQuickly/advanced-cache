'use strict'

const Promise = require('bluebird')
const debug = require('debug')('advanced-cache:base-fetch')

class BaseFetch {

  constructor(redis, redlock, opts) {
    this.redis = redis
    this.opts = opts
    this.redlock = redlock
  }

  _setCache() {
    throw new Error('Not implemented')
  }

  _getCache() {
    throw new Error('Not implemented')
  }

  execute(policy, loadFn, loadFnArgs) {
    if (process.env.NODE_ENV === 'development' && process.env.ADVANCED_CACHE_BYPASS_REDIS_CACHE === '1') {
      debug('bypassing cache')
      return loadFn(loadFnArgs)
    }
    const id = Math.ceil(Math.random() * 10000000)
    return new Promise((resolve, reject) => this._getCached(resolve, reject, id, policy, loadFn, loadFnArgs))
  }

  _lockAndLoad(resolve, reject, id, policy, loadFn, loadFnArgs) {
    const self = this

    this.redlock.lock(policy.lockKey, this.opts.lockIntervalMs, function handleLock(err, lock) {
      if (err) {
        debug('_lockAndLoad', policy.key, id, `lock error. retry load in ${self.opts.retryIntervalMs}ms`)
        return Promise.delay(self.opts.retryIntervalMs)
          .then(() => self._getCached(resolve, reject, id, policy, loadFn, loadFnArgs))
      }

      debug('_lockAndLoad', policy.key, id, 'successfully locked. loading with loadFn')

      loadFn.apply(null, loadFnArgs)
        .then(value => {
          debug('_lockAndLoad', policy.key, id, 'loaded successfully')

          const setCachePromise = value ? self._setCache(policy, value) : Promise.resolve()

          return setCachePromise
            .then(() => lock.unlock())
            .then(() => resolve(value))
            .then(() => debug('_lockAndLoad', policy.key, id, 'set, unlocked'))
        })
        .catch(err => reject(err))
    })
  }

  _getCached(resolve, reject, id, policy, loadFn, loadFnArgs) {
    debug('_getCached', policy.key, id)

    return this._getCache(policy)
      .then(value => {
        if (value) {
          debug('_getCached', policy.key, id, 'found in cache. return')
          this._reloadIfExpiring(id, policy, loadFn, loadFnArgs)
          return resolve(value)
        }

        debug('_getCached', policy.key, id, 'missing in cache. lock and load')
        this._lockAndLoad(resolve, reject, id, policy, loadFn, loadFnArgs)
      })
  }

  _reloadIfExpiring(id, policy, loadFn, loadFnArgs) {
    if (!policy.reloadBefore) {
      return
    }

    const now = Date.now()
    //get redis ttl
    this.redis.getTtl(policy.key)
      .then(ttl => {
        const reloadBefore = policy.reloadBefore * 1000

        if (ttl - now < reloadBefore) {
          return new Promise((resolve, reject) => this._lockAndLoad(resolve, reject, id, policy, loadFn, loadFnArgs))
        }
      })

  }
}

module.exports = BaseFetch
