import Router from 'koa-router'
import CommentsController from '@/api/CommentsController'

const router = new Router()

router.prefix('/comments')

router.post('/add', CommentsController.addComments)
router.post('/edit', CommentsController.editComment)
router.post('/best', CommentsController.bestComment)
router.post('/addhand', CommentsController.addHand)

export default router
