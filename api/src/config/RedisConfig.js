import redis from 'redis'
import config from '../config/index'

const options = {
  host: config.Redis.host,
  port: config.Redis.port,
  password: config.Redis.password,
  detect_buffers: true,
  retry_strategy: function (options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error and flush all commands with
      // a individual error
      return new Error('The server refused the connection')
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands
      // with a individual error
      return new Error('Retry time exhausted')
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined
    }
    // reconnect after
    return Math.min(options.attempt * 100, 3000)
  }
}

const client = redis.createClient(options)
// 监听连接状态
client.on('error', (err) => {
  console.log('Redis is open fail errinfo:' + err)
})

const setValue = (key, value, time) => {
  if (typeof value === 'undefined' || value === null || value === '') {
    return
  }

  if (typeof value === 'string') {
    if (typeof time !== 'undefined') {
      client.set(key, value, 'EX', time)
    } else {
      client.set(key, value)
    }
  }
  if (typeof value === 'object') {
    // { key1:value1 , key2,value2}
    Object.keys(value).forEach((item) => {
      client.hset(key, item, value[item], redis.print)
    })
  }
}
const { promisify } = require('util')
const getAsync = promisify(client.get).bind(client)

const getValue = (key) => {
  return getAsync(key)
}

const getHValue = (key) => {
  return promisify(client.hgetall).bind(client)(key)
}

const delValue = (key) => {
  return client.del(key, redis.print)
}

export { client, setValue, getValue, getHValue, delValue }
