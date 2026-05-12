import HttpRequest from './axios'
import config from '../config/index'

// 开发环境直连后端端口（见 src/config/index.js），避免页面由 8082 静态服务/非代理方式提供时请求仍打到 8082 导致 404。
// 若需走 vue-cli devServer 代理，可在 .env.development.local 中设置 VUE_APP_API_BASE=
const baseUrl =
  process.env.NODE_ENV === 'development'
    ? (typeof process.env.VUE_APP_API_BASE !== 'undefined'
        ? process.env.VUE_APP_API_BASE
        : config.baseUrl.dev)
    : config.baseUrl.pro

const axios = new HttpRequest(baseUrl)

export default axios