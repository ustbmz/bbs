import { getMenuData } from '@/common/Utils'
import bcrypt from 'bcrypt'
import moment from 'dayjs'
import Comments from '../model/Comments'
import Link from '../model/Link'
import Menu from '../model/Menus'
import Post from '../model/Post'
import Roles from '../model/Roles'
import Tags from '../model/Tags'
import User from '../model/User'

class AdminController {
  async getAllPostList (ctx) {
    const { body } = ctx.request
    const sort = body.sort ? body.sort : 'created'
    const page = body.page ? parseInt(body.page) : 0
    const limit = body.limit ? parseInt(body.limit) : 20

    const result = await Post.find().sort({ [sort]: -1 })
      .skip(page * limit)
      .populate({
        path: 'uid',
        select: 'name isVip pic'
      })
    const counts = await Post.queryCount()
    ctx.body = {
      code: 200,
      data: result,
      total: counts,
      msg: '获取列表成功'
    }
  }

  async getTags (ctx) {
    const { body } = ctx.request
    const page = body.page ? parseInt(body.page) : 0
    const limit = body.limit ? parseInt(body.limit) : 10
    const result = await Tags.find().skip(page * limit)
    ctx.body = {
      code: 200,
      data: result,
      msg: '返回标签成功'
    }
  }

  async getTips (ctx) {
    // 向数据库添加测试数据1
    // const link = new Link({
    //   title: '中欧世界第三次大战',
    //   link: 'https://www.baidu/com',
    //   type: 'tip',
    //   isTop: '0',
    //   sort: '0'
    // })
    // const saveRet = link.save()
    // console.log('🚀 ~ file: Links.js ~ line 20 ~ saveRet', saveRet)
    const result = await Link.find({})
    ctx.body = {
      code: 200,
      data: result,
      msg: '获取温馨链接成功'
    }
  }

  async addTag (ctx) {
    const { body } = ctx.request
    const tag = new Tags({
      tagName: body.tagName,
      tagClass: body.tagClass
    })
    const result = await tag.save()
    ctx.body = {
      code: 200,
      data: result,
      msg: '新建成功'
    }
  }

  async addLink (ctx) {
    const { body } = ctx.request
    const link = new Link({
      title: body.title,
      link: body.link,
      type: body.type,
      isTop: body.isTop,
      sort: '0'
    })
    const result = await link.save()
    ctx.body = {
      code: 200,
      data: result,
      msg: '新建成功'
    }
  }

  async updateLinkByID (ctx) {
    const { body } = ctx.request
    const result = await Link.updateOne({ _id: body._id }, body)
    if (result.ok === 1) {
      ctx.body = {
        code: 200,
        data: result,
        msg: '编辑成功'
      }
    } else {
      ctx.body = {
        code: 401,
        data: result,
        msg: '编辑失败'
      }
    }
  }

  async removeLinkById (ctx) {
    const { body } = ctx.request
    const result = await Link.deleteOne({
      _id: body.id
    })
    ctx.body = {
      code: 200,
      msg: '删除成功',
      data: result
    }
  }

  async updatePostByID (ctx) {
    const { body } = ctx.request
    const result = await Post.updateOne({ _id: body._id }, body)
    if (result.ok === 1) {
      ctx.body = {
        code: 200,
        data: result,
        msg: '编辑成功'
      }
    } else {
      ctx.body = {
        code: 401,
        data: result,
        msg: '编辑失败'
      }
    }
  }

  async removePostById (ctx) {
    const { body } = ctx.request
    const result = await Post.deleteOne({
      _id: body.id
    })
    ctx.body = {
      code: 200,
      msg: '删除成功',
      data: result
    }
  }

  async getUsers (ctx) {
    const { body } = ctx.request
    const page = body.page
    const limit = body.limit
    let query = {}
    if (typeof body.option.search !== 'undefined' && body.option.search !== '') {
      const options = body.option
      if (options.item === 'created') {
        const start = options.search[0]
        const end = options.search[1]
        query = { created: { $gte: new Date(start), $lt: new Date(end) } }
      } else if (['name', 'username'].includes(options.item)) {
        // like 查询方式
        query[options.item] = { $regex: new RegExp(options.search) }
      } else {
        query[options.item] = options.search
      }
    }
    const lim = parseInt(limit, 10) || 10
    const pg = parseInt(page, 10) || 0
    const total = await User.countDocuments(query)
    const result = await User.find(query, { password: 0 })
      .skip(pg * lim)
      .limit(lim)
    ctx.body = {
      code: 200,
      msg: '查询成功',
      data: result,
      total
    }
  }

  async checkUserName (ctx) {
    const param = ctx.query
    const user = await User.findOne({ username: param.username })
    let result = 1
    if (user) {
      result = 0
    }
    ctx.body = {
      code: 200,
      data: result
    }
  }

  async deleteUserByID (ctx) {
    const { body } = ctx.request
    const result = await User.deleteMany({ _id: { $in: body.ids } })
    ctx.body = {
      code: 200,
      data: result,
      msg: '删除成功'
    }
  }

  async updateUserByID (ctx) {
    const { body } = ctx.request
    if (body.password) {
      const password = await bcrypt.hash(body.password, 5)
      body.password = password
    }
    const result = await User.updateOne({ _id: body._id }, body)
    ctx.body = {
      code: 200,
      data: result,
      msg: '更新成功'
    }
  }

  async updateUserSettings (ctx) {
    const { body } = ctx.request
    const result = await User.updateMany({ _id: { $in: body.ids } }, { $set: { ...body.settings } })
    ctx.body = {
      code: 200,
      data: result,
      msg: '批量修改用户数据成功'
    }
  }

  async addUser (ctx) {
    const { body } = ctx.request
    const nameExist = await User.findOne({ name: body.name })
    if (nameExist) {
      ctx.body = {
        code: 400,
        msg: '此昵称已存在，请更换'
      }
      return
    }
    // 保存用户信息 写入数据库
    // 密码使用 bcrypt 进行加密存储
    body.password = await bcrypt.hash(body.password, 5)
    const newUser = new User({
      username: body.username,
      name: body.name,
      password: body.password,
      create: moment().format('YYYY-MM-DD hh:mm:ss'),
      isVip: body.isVip,
      location: body.location,
      favs: parseInt(body.favs),
      regmark: body.regmark,
      roles: body.roles,
      status: body.status,
      mobile: body.mobile
    })
    const result = await newUser.save()
    ctx.body = {
      code: 200,
      msg: '注册成功',
      data: result
    }
  }

  async getComments (ctx) {
    const { body } = ctx.request
    const sort = body.sort ? body.sort : 'created'
    const page = body.page ? parseInt(body.page) : 0
    const limit = body.limit ? parseInt(body.limit) : 10

    const result = await Comments.find().sort({ [sort]: -1 })
      .skip(page * limit)
      .populate({
        path: 'uid',
        select: '_id name'
      })
      .populate({
        path: 'cuid',
        select: '_id name'
      })
      .populate({
        path: 'tid',
        select: '_id title'
      })
    const counts = await Comments.find().countDocuments()
    ctx.body = {
      code: 200,
      data: result,
      total: counts,
      msg: '获取评论成功'
    }
  }

  async getMenu (ctx) {
    const result = await Menu.find({})
    ctx.body = {
      code: 200,
      data: result,
      msg: '查询成功'
    }
  }

  async addMenu (ctx) {
    const { body } = ctx.request
    const menu = new Menu(body)
    const result = await menu.save()
    ctx.body = {
      code: 200,
      data: result,
      msg: '添加成功'
    }
  }

  async updateMenu (ctx) {
    const { body } = ctx.request
    const data = { ...body }
    delete data._id
    const result = await Menu.updateOne({ _id: body._id }, { ...data })
    ctx.body = {
      code: 200,
      data: result
    }
  }

  async deleteMenu (ctx) {
    const { body } = ctx.request
    const result = await Menu.deleteOne({ _id: body._id })
    ctx.body = {
      code: 200,
      data: result,
      msg: '删除成功'
    }
  }

  async getRoles (ctx) {
    const result = await Roles.find({})
    ctx.body = {
      code: 200,
      data: result,
      msg: '查询成功'
    }
  }

  async getRolesNames (ctx) {
    const result = await Roles.find({}, { menu: 0, desc: 0 })
    ctx.body = {
      code: 200,
      data: result,
      msg: '查询成功'
    }
  }

  async addRole (ctx) {
    const { body } = ctx.request
    const role = new Roles(body)
    const result = await role.save()
    ctx.body = {
      code: 200,
      data: result,
      msg: '添加成功'
    }
  }

  async updateRole (ctx) {
    const { body } = ctx.request
    const data = { ...body }
    delete data._id
    const result = await Roles.updateOne({ _id: body._id }, { ...data })
    ctx.body = {
      code: 200,
      data: result
    }
  }

  async deleteRole (ctx) {
    const { body } = ctx.request
    const result = await Roles.deleteOne({ _id: body._id })
    ctx.body = {
      code: 200,
      data: result,
      msg: '删除成功'
    }
  }

  // 获取用户的菜单权限，菜单数据
  async getRoutes (ctx) {
    if (!ctx._id) {
      ctx.status = 401
      ctx.body = { code: 401, msg: '未登录或 token 无效' }
      return
    }
    const user = await User.findOne({ _id: ctx._id }, { roles: 1 })
    if (!user) {
      ctx.status = 404
      ctx.body = { code: 404, msg: '用户不存在' }
      return
    }
    const roles = Array.isArray(user.roles) ? user.roles : []
    let menus = []
    for (let i = 0; i < roles.length; i++) {
      const roleName = roles[i]
      const rights = await Roles.findOne({ role: roleName }, { menu: 1 })
      if (rights && Array.isArray(rights.menu)) {
        menus = menus.concat(rights.menu)
      }
    }
    menus = Array.from(new Set(menus))
    // 3. menus -> 可以访问的菜单数据
    const treeData = await Menu.find({})
    // 递归查询 type = 'menu' && _id 包含在menus中
    // 结构进行改造
    const routes = getMenuData(treeData, menus, true)
    ctx.body = {
      code: 200,
      data: routes
    }
  }
}

export default new AdminController()
