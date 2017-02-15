'use strict'

const Redis = require('ioredis')
const Redlock = require('redlock')
const debug = require('debug')('advanced-cache:redis-cache')
const error = require('debug')('advanced-cache:error')

const StringFetch = require('./string-fetch')
const SerializedFetch = require('./serialized-fetch')

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

  stringFetch(policy, loadFn, loadFnArgs) {
    return this._stringFetch.execute(policy, loadFn, loadFnArgs)
  }

  serializedFetch(policy, loadFn, loadFnArgs) {
    return this._serializedFetch.execute(policy, loadFn, loadFnArgs)
  }
}

module.exports = RedisCache
