'use strict'

const Redis = require('ioredis')
const Redlock = require('redlock')

const StringFetch = require('./string')
const CachePolicy = require('./model/policy')
const SerializedFetch = require('./serialized')

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

  asString(arg1, arg2, arg3) {
    return Cache._fetch(arg1, arg2, arg3, this._stringFetch)
  }

  asSerialized(arg1, arg2, arg3) {
    return Cache._fetch(arg1, arg2, arg3, this._serializedFetch)
  }

  static _fetch(arg1, arg2, arg3, fetch) {
    let policy
    let loadFn
    if(arg1 instanceof CachePolicy) {
      policy = arg1
      loadFn = arg2
    } else if(arg3 === undefined) {
      policy = new CachePolicy(arg1.key, arg1.ttl)
      loadFn = arg2
    } else {
      policy = new CachePolicy(arg1, arg2)
      loadFn = arg3
    }
    return fetch.execute(policy, loadFn)
  }
}

module.exports = Cache
