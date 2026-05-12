import { getJWTPayload } from '@/common/Utils'
import WebSocket from 'ws'

class WebSocketServer {
  constructor (config = {}) {
    const defaultConfig = {
      port: 12005,
      timeInterval: 5 * 1000,
      isAuth: true
    }
    // 最终的配置
    const finalconfig = { ...defaultConfig, ...config }
    this.wss = {}
    this.interval = finalconfig.timeInterval
    this.port = finalconfig.port
    this.isAuth = finalconfig.isAuth
  }

  // 初始化websocket服务
  init () {
    this.wss = new WebSocket.Server({
      port: this.port, ...this.options
    })

    // 心跳检测
    this.heartbeat()

    // 连接信息
    this.wss.on('connection', (ws) => {
      ws.isAlive = true
      ws.on('message', (msg) => this.onMessage(ws, msg))
      ws.on('close', () => this.onClose(ws))
    })
  }

  onMessage (ws, msg) {
    // 用户鉴权
    const msgObj = JSON.parse(msg)

    const events = {
      auth: async () => {
        try {
          const obj = await getJWTPayload(msgObj.message)
          if (obj) {
            ws.isAuth = true
            ws._id = obj.id
            ws.send(JSON.stringify({
              event: 'auth',
              message: 'auth is ok'
            }))
          }
        } catch (error) {
          ws.send(JSON.stringify({
            event: 'noauth',
            message: 'auth is fail'
          }))
        }
      },
      heartbeat: () => {
        if (msgObj.message === 'pong') {
          ws.isAlive = true
        }
      },
      message: () => {
        if (!ws.isAuth && this.isAuth) {
          return
        }
        this.wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client._id === ws._id) {
            this.send(msg)
          }
        })
      }
    }
    events[msgObj.event]()

    // 心跳检测
    // 消息发送
  }

  send (uid, msg) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client._id === uid) {
        client.send(msg)
      }
    })
  }

  broadcast (msg) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg)
      }
    })
  }

  onClose () {
    console.log('disconnected')
  }

  heartbeat () {
    clearInterval(this.interval)
    this.interval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          return ws.terminate()
        }
        // 主动发送心跳检测请求
        // 当客户端返回了消息之后，主动设置flag为在线
        ws.isAlive = false
        ws.send(JSON.stringify({
          event: 'heartbeat',
          message: 'ping'
        }))
      })
    }, this.timeInterval)
  }
}

export default WebSocketServer
