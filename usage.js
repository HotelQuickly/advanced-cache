'use strict'

const Promise = require('bluebird')
const debug = require('debug')('advanced-cache:usage')

const advancedCache = require('./')

const RedisCache = advancedCache.RedisCache
const CachePolicy = advancedCache.CachePolicy

const cache = new RedisCache({
  port: 6379,
  host: '127.0.0.1',
  keyPrefix: 'usage-test:'
})

const policy = new CachePolicy(['code', 2], 10, 10)

function loadFn() {
  return Promise.delay(100).then(() => Promise.resolve('BY'))
}

return Promise
  .all([
    cache.asString(policy, loadFn),
    cache.asString(policy, loadFn),
    cache.asString(policy, loadFn)
  ])
  .then(x => {
    debug(x)
    //process.exit(1)
  })
