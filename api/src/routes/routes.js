import combineRoutes from 'koa-combine-routers'

import adminRouter from './modules/adminRouter'
import blogRouter from './modules/blogRouter'
import commnetsRouter from './modules/commnetsRouter'
import contentRouter from './modules/contentRouter'
import loginRouter from './modules/loginRouter'
import publicRouter from './modules/publicRouter'
import userRouter from './modules/userRouter'

const modules = [
  adminRouter,
  blogRouter,
  commnetsRouter,
  contentRouter,
  loginRouter,
  publicRouter,
  userRouter
]

export default combineRoutes(modules)
