'use strict'

class CachePolicy {
  constructor(keyParts, ttl, reloadBefore) {
    this.key = keyParts.join(':')
    this.ttl = ttl
    this.reloadBefore = reloadBefore
    this.lockKey = `${this.key}:lock`
  }
}

module.exports = CachePolicy
