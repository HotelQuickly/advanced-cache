'use strict'

const Base = require('./base')
const debug = require('debug')('advanced-cache:string')

class StringFetch extends Base {

  constructor(redis, redlock, opts) {
    super(redlock, opts)
    this.redis = redis
  }

  _setCache(policy, value) {
    debug('setString', policy.key, policy.ttl, value)

    return this.redis
      .set(policy.key, value, 'EX', policy.ttl)
  }

  _getCache(policy) {
    debug('getString', policy.key)

    return this.redis
      .get(policy.key)
  }
}

module.exports = StringFetch