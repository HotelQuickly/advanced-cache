'use strict'

module.exports = {
  RedisCache: require('./lib/redis-cache'),
  MemoryCache: require('./lib/memory-cache'),
  CachePolicy: require('./lib/cache-policy'),
  HashCachePolicy: require('./lib/hash-cache-policy')
}
