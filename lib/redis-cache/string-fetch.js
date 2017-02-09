'use strict'

const BaseFetch = require('./base-fetch')
const debug = require('debug')('advanced-cache:string-fetch')

class StringFetch extends BaseFetch {

  constructor(redis, redlock, opts) {
    super(redis, redlock, opts)
  }

  _setCache(policy, value) {
    debug('setString', policy.key, policy.ttl, value)

    return this.redis.set(policy.key, value, 'EX', policy.ttl)
  }

  _getCache(policy) {
    debug('getString', policy.key)

    return this.redis.get(policy.key)
  }
}

module.exports = StringFetch
