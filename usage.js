'use strict'

const Promise = require('bluebird')

const advancedCache = require('./')

const RedisCache = advancedCache.RedisCache
const CachePolicy = advancedCache.CachePolicy

const cache = new RedisCache({
  port: 6379,
  host: '127.0.0.1',
  keyPrefix: 'usage-test:'
})

const policy = new CachePolicy(['code', 2], 60)

function loadFn() {
  return Promise.delay(100).then(() => Promise.resolve('BY'))
}

return Promise
  .all([
    cache.stringFetch(policy, loadFn),
    cache.stringFetch(policy, loadFn),
    cache.stringFetch(policy, loadFn)
  ])
  .then(x => {
    console.log(x)
    process.exit(1)
  })
