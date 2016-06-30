# Advanced cache based on ioredis and redlock 

https://www.npmjs.com/package/ioredis

https://www.npmjs.com/package/redlock

Main points to have this module are:
 * reduce load on data storage on cold start
 * unify repetitive actions as: get from cache if not load from db
 
Note: caches value only if result of load function is converted to true: `!!result === true`
 
# How to use
```js
  const Cache = require('advanced-cache')
  
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
  
  const cache = new Cache(ioRedisOpts, opts, redlockOpts) //opts and redlockOpts are optional and have defaults
  
  const countryCodePolicy = new CachePolicy([country-code', 5], 24 * 60 * 60)
  const userPolicy = new CachePolicy(['user', 12], 60 * 60)
  cache.asString(countryCodePolicy, fetchCountryStringCodeFromSomeWherePromise).then(countryCode => {})
  cache.asSerialized(userPolicy, fetchUserObjectFromSomeWherePromise).then(user => user.fly())
  
  cache.redis.mget(['country-code:13', 'user:12']).then(() => {}) //when you need to get access to redis client
```
