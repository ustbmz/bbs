import svgCaptcha from 'svg-captcha'
import { setValue } from '../config/RedisConfig.js'
import User from '@/model/User'
import Comments from '@/model/Comments'
import Post from '@/model/Post'
import moment from 'dayjs'

class DemoController {
  async getCaptcha (ctx) {
    const res = ctx.request.query
    console.log(res.sid)
    const captcha = svgCaptcha.create({
      ignoreChars: '0oil1',
      noise: 0,
      color: true,
      width: 150,
      height: 50,
      charPreset: '123456'
    })
    // console.log(captcha)
    setValue(res.sid, captcha.text, 10 * 60)
    ctx.body = {
      code: 200,
      data: captcha.data,
      text: captcha.text
    }
  }

  async getUserInfo (ctx) {
    const { body } = ctx.request
    const user = await User.findByID({ _id: body.uid })
    ctx.body = {
      code: 200,
      data: user,
      msg: '查询成功'
    }
  }

  async getPostListByUid (ctx) {
    const { body } = ctx.request
    const result = await Post.find({ uid: body.uid }).sort({ created: -1 })
    ctx.body = {
      code: 200,
      data: result,
      msg: '查询成功'
    }
  }

  async getCommentsByUid (ctx) {
    const { body } = ctx.request
    const result = await Comments.getCommentsPublic(body.uid)
    ctx.body = {
      code: 200,
      data: result,
      msg: '查询成功'
    }
  }

  async getHotPost (ctx) {
    const params = ctx.query
    const page = params.page ? parseInt(params.page) : 0
    const limit = params.limit ? parseInt(params.limit) : 10
    const index = params.index ? params.index : '0'
    let start = ''
    let end = ''
    if (index === '0') {
      start = moment().subtract(3, 'day').format('YYYY-MM-DD 00:00:00')
    } else if (index === '1') {
      start = moment().subtract(7, 'day').format('YYYY-MM-DD 00:00:00')
    } else if (index === '2') {
      start = moment().subtract(30, 'day').format('YYYY-MM-DD 00:00:00')
    }
    end = moment().add(1, 'day').format('YYYY-MM-DD 00:00:00')
    const result = await Post.getHotPost(start, end, limit, page)
    ctx.body = {
      code: 200,
      data: result
    }
  }

  async getHotComments (ctx) {
    const params = ctx.query
    const page = params.page ? parseInt(params.page) : 0
    const limit = params.limit ? parseInt(params.limit) : 10
    const index = params.index ? params.index : '0'

    const result = await Comments.getHotComments(index, limit, page)
    ctx.body = {
      code: 200,
      data: result
    }
  }

  async getHotSign (ctx) {
    const params = ctx.query
    const page = params.page ? parseInt(params.page) : 0
    const limit = params.limit ? parseInt(params.limit) : 10
    const index = params.index ? params.index : '0'
    const result = await User.getHotSign(index, limit, page)
    const total = await User.getTotalHotSign()
    ctx.body = {
      code: 200,
      total: total,
      data: result
    }
  }
}

export default new DemoController()
