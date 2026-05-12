import config from '@/config'
import { getToken, setTitle, setToken } from '@/libs/util'
import store from '@/store'
import iView from 'view-design'
import Vue from 'vue'
import Router from 'vue-router'
import routes from './routers'
const { homeName } = config

Vue.use(Router)

const LOGIN_PAGE_NAME = 'login'

// const turnTo = (to, access, next) => {
//   if (canTurnTo(to.name, access, routes)) next() // 有权限，可访问
//   else next({ replace: true, name: 'error_401' }) // 无权限，重定向到401页面
// }

const createRouter = () =>
  new Router({
    mode: 'history',
    routes: routes
  })

const beforeEachHandler = (to, from, next) => {
  iView.LoadingBar.start()

  if (to.name === 'error_404' && !store.state.loaded) {
    const ctrl = setInterval(() => {
      if (store.state.loaded) {
        clearInterval(ctrl)
        router.push(to.path)
      }
    }, 50)
    return
  }

  const token = getToken()
  if (!token && to.name !== LOGIN_PAGE_NAME) {
    // 未登录且要跳转的页面不是登录页
    next({
      name: LOGIN_PAGE_NAME // 跳转到登录页
    })
  } else if (!token && to.name === LOGIN_PAGE_NAME) {
    // 未登陆且要跳转的页面是登录页
    next() // 跳转
  } else if (token && to.name === LOGIN_PAGE_NAME) {
    // 已登录且要跳转的页面是登录页
    next({
      name: homeName // 跳转到homeName页
    })
  } else {
    if (store.state.user.hasGetInfo) {
      // turnTo(to, store.state.user.access, next)
      next()
    } else {
      store
        .dispatch('getUserInfo')
        .then((user) => {
          // 拉取用户信息，通过用户权限和跳转的页面的name来判断是否有权限访问;access必须是一个数组，如：['super_admin'] ['super_admin', 'admin']
          // turnTo(to, user.access, next)
          next()
        })
        .catch(() => {
          setToken('')
          next({
            name: 'login'
          })
        })
    }
  }
}

const afterEachHandler = (to) => {
  setTitle(to, router.app)
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
}

const router = createRouter()

router.beforeEach = beforeEachHandler
router.afterEach = afterEachHandler

export const resetRouter = () => {
  const newRouter = createRouter()
  newRouter.beforeEach = beforeEachHandler
  newRouter.afterEach = afterEachHandler
  router.matcher = newRouter.matcher // the relevant part
}

export default router
