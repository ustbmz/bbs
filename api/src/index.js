import cors from '@koa/cors'
import Koa from 'koa'
import koaBody from 'koa-body'
import compose from 'koa-compose'
import compress from 'koa-compress'
import helmet from 'koa-helmet'
import jsonutil from 'koa-json'
import JWT from 'koa-jwt'
import statics from 'koa-static'
import path from 'path'
import auth from './common/Auth'
import errorHandle from './common/ErrorHandle'
import config from './config/index'
import WebSocketServer from './config/WebSocket'
import router from './routes/routes'
const app = new Koa()

const isDevMode = process.env.NODE_ENV !== 'production'

// 定义公共路径，不需要jwt鉴权
const jwt = JWT({ secret: config.JWT_SECRET }).unless({
  path: [/^\/public/, /^\/login/]
})

// 初始化websocket
const ws = new WebSocketServer()
ws.init()
// websocket 配置为全局对象
global.ws = ws
/**
 * 使用koa-compose 集成中间件
 */
const middleware = compose([
  koaBody({
    multipart: true,
    formidable: {
      keepExtensions: true,
      maxFieldsSize: 5 * 1024 * 1024
    },
    onError: (err) => {
      console.log('🚀 ~ file: index.js ~ line 64 ~ err', err)
    }
  }),
  // 为什么statics目录还需要jwt鉴权
  statics(path.join(__dirname, '../public')),
  cors(),
  jsonutil({ pretty: false, param: 'pretty' }),
  helmet(),
  errorHandle,
  jwt,
  auth
])

if (!isDevMode) {
  app.use(compress())
}
app.use(middleware)
app.use(router())

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000')
})
