'use strict'

const BaseFetch = require('./base-fetch')
const debug = require('debug')('advanced-cache:hash-fetch')

class HashFetch extends BaseFetch {

  constructor(redis, redlock, opts) {
    super(redis, redlock, opts)
  }

  _setCache(policy, value) {
    debug('setHash', policy.key, policy.ttl, value)

    return this.redis.hmset(policy.key, value)
      .then(() => this.redis.expire(policy.key, policy.ttl))
  }

  _getCache(policy) {
    debug('getHash', policy.key)

    return this.redis.exists(policy.key)
      .then(exists => {
        if (!exists) {
          return null
        }

        return this.redis.hmget(policy.key, policy.fields)
          .then(values => _mapHash(values, policy.fields))
      })
  }
}

module.exports = HashFetch

function _mapHash(values, fields) {
  const hash = {}

  fields.forEach((field, index) => {
    const value = values[index]
    if (value) {
      hash[field] = value
    }
  })

  return hash
}
