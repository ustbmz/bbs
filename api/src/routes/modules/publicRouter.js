import Router from 'koa-router'
import ContentController from '@/api/ContentController'
import CommentsController from '@/api/CommentsController'
import UserController from '@/api/UserController'
import PublicController from '@/api/publicController'

const router = new Router()

router.prefix('/public')
router.get('/getCaptcha', PublicController.getCaptcha)

router.post('/list', ContentController.getPostList)
router.get('/links', ContentController.getAllLinks)
router.get('/tips', ContentController.getTips)
router.get('/topWeek', ContentController.getTopWeek)
router.get('/reset-email', UserController.resetEamil)
router.post('/reset-passwd', UserController.resetPasswd)
router.get('/content/detail', ContentController.getPostDetail)
router.get('/comments', CommentsController.getCommentsByTid)
router.post('/userinfo', PublicController.getUserInfo)
router.post('/postlist', PublicController.getPostListByUid)
router.post('/commentslist', PublicController.getCommentsByUid)

// webapp hot api
router.get('/hotPost', PublicController.getHotPost)
router.get('/hotComments', PublicController.getHotComments)
router.get('/hotSign', PublicController.getHotSign)

export default router
