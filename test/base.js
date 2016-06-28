'use strict'

const sinon = require('sinon')
const should = require('should')
const Promise = require('bluebird')
const StringFetch = require('../lib/string')
const CachePolicy = require('../lib/model/policy')

require('should-sinon')
const sandbox = sinon.sandbox.create()

const redlock = {
  lock() {
  }
}

const redis = {
  get() {
  },
  set() {
  }
}

const opts = {
  lockIntervalMs: 5,
  retryIntervalMs: 2
}

const lock = {
  unlock() {
  }
}
const fetch = new StringFetch(redis, redlock, opts)

describe('String Cache', () => {

  afterEach(() => {
    sandbox.restore()
  })

  it('should lock and load if value is not in cache yet', () => {

    const value = 'TH'
    const policy = new CachePolicy(['country-code', 1], 20)

    sandbox.stub(redis, 'get').returns(Promise.resolve(null))
    sandbox.stub(redis, 'set').returns(Promise.resolve())
    sandbox.stub(redlock, 'lock').callsArgWithAsync(2, null, lock)

    const loadSpy = sandbox.spy(() => Promise.resolve(value))

    return fetch.execute(policy, loadSpy)
      .then(val => {
        val.should.equal(value)

        redis.get.should.be.calledOnce()
        redis.set.should.be.calledOnce()
        redlock.lock.should.be.calledOnce()
        loadSpy.should.be.calledOnce()
      })
  })

  it('should not load but return value from cache if it is already there', () => {

    const value = 'US'
    const policy = new CachePolicy(['country-code', 2], 20)

    sandbox.stub(redis, 'get').returns(Promise.resolve(value))
    sandbox.stub(redis, 'set').returns(Promise.resolve())
    sandbox.stub(redlock, 'lock').callsArgWithAsync(2, null, lock)

    const loadSpy = sandbox.spy(() => Promise.resolve())

    return fetch.execute(policy, loadSpy)
      .then(val => {
        val.should.equal(value)

        redis.get.should.be.calledOnce()
        redis.set.should.not.be.called()
        redlock.lock.should.not.be.called()
        loadSpy.should.not.be.called()
      })
  })

  it('should not call loadFn if somebody is already loading data', () => {

    const value = 'RU'
    const policy = new CachePolicy(['country-code', 3], 20)

    sandbox.stub(redis, 'get')
      .onFirstCall().returns(Promise.resolve(null))
      .onSecondCall().returns(Promise.resolve(null))
      .onThirdCall().returns(Promise.resolve(value))

    sandbox.stub(redis, 'set', () => Promise.resolve())
    sandbox.stub(redlock, 'lock')
      .onFirstCall().callsArgWithAsync(2, null, lock)
      .onSecondCall().callsArgWithAsync(2, new Error, lock)

    const loadSpy = sandbox.spy(() => Promise.resolve(value))

    return Promise
      .all([
        fetch.execute(policy, loadSpy),
        fetch.execute(policy, loadSpy)
      ])
      .spread((val1, val2) => {
        val1.should.equal(value)
        val2.should.equal(value)

        redis.get.should.be.calledThrice()
        redis.set.should.be.calledOnce()
        redlock.lock.should.be.calledTwice()

        loadSpy.should.be.calledOnce()
      })
  })
})
