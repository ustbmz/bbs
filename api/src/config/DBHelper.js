import mongoose from 'mongoose'
import config from './index'

mongoose.set('useCreateIndex', true)

mongoose
  .connect(config.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch((err) => {
    console.error('MongoDB 连接失败:', err.message)
    console.error(
      '需先在本机启动 Mongo（默认 127.0.0.1:27017）并配置与 src/config/index.js 中 DB_URL 一致的用户与库，否则依赖数据库的接口会失败。'
    )
  })

mongoose.connection.on('connected', () => {
  console.log('mongoose String at :' + config.DB_URL)
})

mongoose.connection.on('err', (err) => {
  console.log('mongoose connected errinfo:' + err)
})

mongoose.connection.on('disconnected', (err) => {
  console.log('mongoose connected disconnected:' + err)
})

export default mongoose
