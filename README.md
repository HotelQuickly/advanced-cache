# Advanced cache based on ioredis, redlock and node-cache 

Main points to have this module are:
 * reduce load on data storage on cold start
 * unify repetitive actions as: get from cache if not load from db
 * reload cache before it expires
 
Note: caches value only if result of load function is converted to true: `!!result === true`
 
# How to use
```js
  const advancedCache = require('advanced-cache')
  
  const RedisCache = advancedCache.RedisCache
  const MemoryCache = advancedCache.MemoryCache
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
  cache.asString(countryCachePolicy, fetchCountryStringCodeFromSomeWherePromise).then(countryCode => {})
  cache.asSerialized(userCachePolicy, fetchUserObjectFromSomeWherePromise).then(user => user.fly())

 //when you need direct access to redis client
  cache.redis.mget(['country-code:13', 'user:12']).then(() => {})
```

# How to bypass cache
During development sometimes it handy just bypass cache and fetch data directly from load function.
<br />To make it happen add environment variable **ADVANCED_CACHE_BYPASS_CACHE** equal to *1*
<br />Though it will work only if your **NODE_ENV** equals *development*
