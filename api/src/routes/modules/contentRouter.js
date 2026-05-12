import Router from 'koa-router'
import ContentController from '@/api/ContentController'

const router = new Router()
router.prefix('/content')
router.post('/upload', ContentController.uploadImg)
router.post('/add', ContentController.addPost)
router.post('/update', ContentController.updatePost)
router.post('/mypost', ContentController.getPostListByUid)
router.post('/user-collect', ContentController.userCollect)
router.post('/remove-collect', ContentController.removeCollect)
router.post('/collect', ContentController.getUserCollect)

export default router
