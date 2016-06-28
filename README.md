# Advanced cache based on ioredis and redlock 

https://www.npmjs.com/package/ioredis
https://www.npmjs.com/package/relock

Main points to have this module are:
 * reduce load on data storage on cold start
 * unify repetitive actions as: get from cache if not load from db
 
# How to use
```js
  const Cache = require('advanced-cache)
  
  const ioRedisOpts = {}
  const redlockOpts = {}
  const opts = {
    lockIntervalMs: 50, //time in ms key is locked to load data from store
    retryIntervalMs: 5  //time failed lock waits before next try
  }
  
  const cache = new Cache()
```
