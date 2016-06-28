'use strict'

const Base = require('./base')
const debug = require('debug')('advanced-cache:string')

class StringFetch extends Base {

  constructor(redis, redlock, opts) {
    this.redis = redis
    super(redlock, opts)
  }

  _setCache(policy, value) {
    debug('setString', policy.key, policy.ttl, value)

    return this.redis
      .set(policy.key, value)
      .then(() => this.redis.expire(policy.key, policy.ttl))
  }

  _getCache(policy) {
    debug('getString', policy.key)

    return this.redis
      .get(policy.key)
  }
}

module.exports = StringFetch
