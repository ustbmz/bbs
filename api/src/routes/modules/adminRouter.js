// import CommentsController from '@/api/CommentsController'
import AdminController from '@/api/AdminController'
import Router from 'koa-router'

const router = new Router()

router.prefix('/admin')

router.post('/lists', AdminController.getAllPostList)
router.post('/content/delete', AdminController.removePostById)
router.post('/content/updateId', AdminController.updatePostByID)

router.post('/getTags', AdminController.getTags)
router.post('/addTag', AdminController.addTag)

router.post('/getLinks', AdminController.getTips)
router.post('/addLink', AdminController.addLink)
router.post('/updateLink', AdminController.updateLinkByID)
router.post('/delLink', AdminController.removeLinkById)

router.post('/getComments', AdminController.getComments)

router.post('/users', AdminController.getUsers)
router.get('/checkname', AdminController.checkUserName)
router.post('/updateUser', AdminController.updateUserByID)
router.post('/updateUserSettings', AdminController.updateUserSettings)
router.post('/deleteUser', AdminController.deleteUserByID)
router.post('/addUser', AdminController.addUser)

router.post('/addMenu', AdminController.addMenu)
router.get('/getMenu', AdminController.getMenu)
router.post('/deleteMenu', AdminController.deleteMenu)
router.post('/updateMenu', AdminController.updateMenu)

router.post('/addRole', AdminController.addRole)
router.get('/getRoles', AdminController.getRoles)
router.get('/getRolesNames', AdminController.getRolesNames)
router.post('/deleteRole', AdminController.deleteRole)
router.post('/updateRole', AdminController.updateRole)

router.get('/getRoutes', AdminController.getRoutes)

export default router
