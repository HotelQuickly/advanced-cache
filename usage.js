'use strict'

const Cache = require('./index')
const CachePolicy = require('./index').CachePolicy
const Promise = require('bluebird')
const debug = require('debug')('usage')

const cache = new Cache({
  port: 6379,
  host: '192.168.99.100',
  keyPrefix: 'awesome:'
})

const policy = new CachePolicy(['code', 2], 60)

function loadFn() {
  return Promise.delay(100).then(() => Promise.resolve('BY'))
}

Promise.join(
  cache.asString(policy, loadFn).then(() => debug('1st finished')),
  cache.asString(policy, loadFn).then(() => debug('2nd finished')),
  cache.asString(policy, loadFn).then(() => debug('3rd finished')),
  function () {
    debug('all finished')
  }
)
