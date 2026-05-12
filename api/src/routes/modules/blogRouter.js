// import CommentsController from '@/api/CommentsController'
import BlogController from '@/api/BlogController'
import Router from 'koa-router'

const router = new Router()

router.prefix('/public')

router.post('/getMDS', BlogController.getMDS)
router.post('/addMD', BlogController.addMD)
router.post('/updateMD', BlogController.updateMD)
router.post('/deleteMD', BlogController.deleteMD)

export default router
