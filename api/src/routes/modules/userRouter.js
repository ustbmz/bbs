import Router from 'koa-router'
import UserController from '@/api/UserController'

const router = new Router()

router.prefix('/user')

router.get('/fav', UserController.userSign)
router.post('/basic', UserController.updateUserInfo)
router.post('/password', UserController.updatePassword)
router.post('/getmsg', UserController.getMsg)
router.post('/readallmsg', UserController.readAllMsg)
router.post('/readonemsg', UserController.readOneMsg)

export default router
