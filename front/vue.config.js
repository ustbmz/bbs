/** 开发时代理到本地后端；proxy 须为对象（Vue CLI 4 / webpack-dev-server 不接受数组写法） */
const apiTarget = 'http://127.0.0.1:3000'
const proxyPaths = ['/public', '/login', '/user', '/content', '/comments']

const proxy = proxyPaths.reduce((acc, p) => {
  acc[p] = { target: apiTarget, changeOrigin: true }
  return acc
}, {})

module.exports = {
  devServer: {
    port: 8082,
    proxy,
  },
}
