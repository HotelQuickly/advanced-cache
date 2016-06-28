# Advanced cache based on ioredis and redlock 

https://www.npmjs.com/package/ioredis

https://www.npmjs.com/package/redlock

Main points to have this module are:
 * reduce load on data storage on cold start
 * unify repetitive actions as: get from cache if not load from db
 
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
    retryCount: 1
  }
  
  const opts = {
    lockIntervalMs: 50, //time in ms key is locked to load data from store
    retryIntervalMs: 5  //time failed lock waits before next try
  }
  
  const cache = new Cache(ioRedisOpts, redlockOpts, opts)
  
  cache.asString(['country-code', 13], fetchCountryStringCodeFromSomeWherePromise).then(countryCode => {})
  cache.asSerialized(['user', 12], fetchUserObjectFromSomeWherePromise).then(user => user.fly())
  
  cache.redis.mget(['country-code:13', 'user:12']).then(() => {}) //when you need to get access to redis client
```
