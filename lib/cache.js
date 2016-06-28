'use strict'

const Redis = require('ioredis')
const Redlock = require('redlock')

const StringFetch = require('./string')
const SerializedFetch = require('./serialized')
const CachePolicy = require('./model/policy')

const debug = require('debug')('advanced-cache:cache')
const error = require('debug')('advanced-cache:error')

class Cache {

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

  asString(keyParts, ttl, loadFn) {
    const policy = new CachePolicy(keyParts, ttl)
    return this._stringFetch.execute(policy, loadFn)
  }

  asSerialized(keyParts, ttl, loadFn) {
    const policy = new CachePolicy(keyParts, ttl)
    return this._serializedFetch.execute(policy, loadFn)
  }
}

module.exports = Cache
