'use strict'

const StringFetch = require('./string')
const debug = require('debug')('advanced-cache:serialized')

class SerializedFetch extends StringFetch {

  constructor(redis, redlock, opts) {
    super(redis, redlock, opts)
  }

  _setCache(policy, value) {
    debug('setSerialized', policy.key, policy.ttl, value)

    value = JSON.stringify(value)
    return super._setCache(value)
  }

  _getCache(policy) {
    debug('getSerialized', policy.key)
    return super._getCache().then(value => JSON.parse(value))
  }
}

module.exports = SerializedFetch
