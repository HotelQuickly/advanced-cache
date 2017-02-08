'use strict'


class CachePolicy {
  constructor(keyParts, ttl, reloadBefore) {
    this.key = CachePolicy._getKey(keyParts)
    this.ttl = ttl
    this.reloadBefore = reloadBefore
    this.lockKey = `${this.key}:lock`
  }

  static _getKey() {
    if (arguments.length === 0) {
      throw new Error('invalid arguments for keyParts')
    }

    let keys
    if (Array.isArray(arguments[0])) {
      keys = arguments[0]
    } else {
      keys = Array.prototype.slice.call(arguments)
    }

    return keys.join(':')
  }
}

module.exports = CachePolicy
