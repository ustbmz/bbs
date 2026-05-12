import moment from 'dayjs'
import Blog from '../model/Blog'

class BlogController {
  async getMDS (ctx) {
    const { body } = ctx.request
    const type = body.type ? body.type : ''
    const sort = body.sort ? body.sort : 'created'
    const page = body.page ? parseInt(body.page) : 0
    const limit = body.limit ? parseInt(body.limit) : 20
    let result = {}
    if (type !== '') {
      result = await Blog.getList({ type: type }, sort, page, limit)
    } else {
      result = await Blog.getList({}, sort, page, limit)
    }
    const counts = await Blog.queryCount()
    ctx.body = {
      code: 200,
      data: result,
      total: counts,
      msg: '获取列表成功'
    }
  }

  async addMD (ctx) {
    const { body } = ctx.request
    const newMD = new Blog({
      author: body.author,
      title: body.title,
      content: body.content,
      type: body.type,
      create: moment().format('YYYY-MM-DD hh:mm:ss')
    })
    const result = await newMD.save()
    ctx.body = {
      code: 200,
      msg: '新增文章成功',
      data: result
    }
  }

  async deleteMD (ctx) {
    const { body } = ctx.request
    const result = await Blog.deleteOne({
      _id: body.id
    })
    ctx.body = {
      code: 200,
      msg: '删除成功',
      data: result
    }
  }

  async updateMD (ctx) {
    const { body } = ctx.request
    const result = await Blog.updateOne({ _id: body._id }, body)
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
}

export default new BlogController()
