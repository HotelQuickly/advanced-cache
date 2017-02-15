# Advanced cache based on ioredis, redlock and node-cache 

Main points to have this module are:
 * reduce load on data storage on cold start
 * unify repetitive actions as: get from cache if not load from db
 * reload cache before it expires
 
Note: caches value only if result of load function is converted to true: `!!result === true`
 
# How to use RedisCache
```js
  const advancedCache = require('advanced-cache')
  
  const RedisCache = advancedCache.RedisCache
  const CachePolicy = advancedCache.CachePolicy
  
  const ioRedisOpts = {
    port: 6379,
    host: '127.0.0.1',
    password: 'auth',
    keyPrefix: 'some:'
  }

  const redlockOpts = {
    retryCount: 0 //default
  }
  
  const opts = {
    lockIntervalMs: 1000, //time in ms key is locked to load data from store (default)
    retryIntervalMs: 50  //time failed lock waits before next try (default)
  }

  const cache = new RedisCache(ioRedisOpts, opts, redlockOpts) //opts and redlockOpts are optional and have defaults

  const countryCachePolicy = new CachePolicy(['country-code', 5], 24 * 60 * 60)
  const userCachePolicy = new CachePolicy(['user', 12], 60 * 60)
  cache.stringFetch(countryCachePolicy, loadAsStringPromise).then(countryCode => {})
  cache.serializedFetch(userCachePolicy, loadAsObjectPromise).then(user => user.fly())
 //when you need direct access to redis client
  cache.redis.mget(['country-code:13', 'user:12']).then(() => {})
```

# How to use MemoryCache
```js
  const advancedCache = require('advanced-cache')

  const MemoryCache = advancedCache.MemoryCache //extended from NodeCache
  const CachePolicy = advancedCache.CachePolicy

  const opts = {useClones: false} //default opts
  const cache = new MemoryCache(opts)
  
  const countryCachePolicy = new CachePolicy(['country-code', 5], 24 * 60 * 60)
  cache.fetch(countryCachePolicy, loadPromise).then(countryCode => {})
```

# How to bypass cache
Sometimes during development it handy just bypass cache and fetch data directly from load function
<br />To bypass RedisCache add environment variable **ADVANCED_CACHE_BYPASS_REDIS_CACHE** equal to *1*
<br />To bypass MemoryCache add environment variable **ADVANCED_CACHE_BYPASS_MEMORY_CACHE** equal to *1*
<br />Though it will work only if your **NODE_ENV** equals *development*
