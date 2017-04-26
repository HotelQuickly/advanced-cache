'use strict'

const CachePolicy = require('./cache-policy')

class HashCachePolicy extends CachePolicy {

  constructor(keyParts, ttl, reloadBefore, fields) {
    super(keyParts, ttl, reloadBefore)
    this.fields = fields
  }
}

module.exports = HashCachePolicy
