'use strict'

const StringFetch = require('./string-fetch')
const debug = require('debug')('advanced-cache:serialized-fetch')

class SerializedFetch extends StringFetch {

  constructor(redis, redlock, opts) {
    super(redis, redlock, opts)
  }

  _setCache(policy, value) {
    debug('setSerialized', policy.key, policy.ttl, value)

    value = JSON.stringify(value)
    return super._setCache(policy, value)
  }

  _getCache(policy) {
    debug('getSerialized', policy.key)
    return super._getCache(policy).then(value => JSON.parse(value))
  }
}

module.exports = SerializedFetch
