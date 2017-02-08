'use strict'

const Redis = require('ioredis')
const Redlock = require('redlock')
const debug = require('debug')('advanced-cache:cache')
const error = require('debug')('advanced-cache:error')

const StringFetch = require('./string')
const SerializedFetch = require('./serialized')

class RedisCache {

  /**
   * @param ioRedisOpts
   * @param [opts]
   * @param opts.lockIntervalMs
   * @param opts.retryIntervalMs
   * @param [redlockOpts]
   */
  constructor(ioRedisOpts, opts, redlockOpts) {

    opts = opts || {}
    redlockOpts = redlockOpts || {}

    const redlockDefaultOpts = {retryCount: 0}
    const defaultOpts = {lockIntervalMs: 1000, retryIntervalMs: 50}

    this._opts = Object.assign(defaultOpts, opts)
    this.redis = new Redis(ioRedisOpts)
    this.redlock = new Redlock([this.redis], Object.assign(redlockDefaultOpts, redlockOpts))

    this.redis.on('connect', () => debug('connected to redis'))
    this.redis.on('error', err => {
      error(`redis connection failed: ${err.message}`)
    })

    this._stringFetch = new StringFetch(this.redis, this.redlock, this._opts)
    this._serializedFetch = new SerializedFetch(this.redis, this.redlock, this._opts)
  }

  asString(policy, loadFn, loadFnArgs) {
    return RedisCache._fetch(policy, loadFn, loadFnArgs, this._stringFetch)
  }

  asSerialized(policy, loadFn, loadFnArgs) {
    return RedisCache._fetch(policy, loadFn, loadFnArgs, this._serializedFetch)
  }

  static _fetch(policy, loadFn, loadFnArgs, fetch) {
    if (policy.reloadBefore) {
      this._reload(policy, loadFn, loadFnArgs)
    }

    if (policy.reloadBefore) {
      this._reload(policy, loadFn, policy, loadFn, loadFnArgs, fetch)
    }

    return fetch.execute(policy, loadFn, loadFnArgs)
  }

  _reload(policy, loadFn, loadFnArgs, fetch) {
    const now = Date.now()
    const ttl = this.getTtl(policy.key)
    const reloadBefore = policy.reloadBefore * 1000

    if (ttl - now < reloadBefore) {
      fetch.execute(policy, loadFn, loadFnArgs)
    }
  }
}

module.exports = RedisCache
