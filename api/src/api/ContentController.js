// import { dirExists } from '@/common/Utils'
import { CheckCode, getJWTPayload, rename } from '@/common/Utils'
import config from '@/config/index'
import moment from 'dayjs'
import fs from 'fs'
import mkdir from 'make-dir'
import { v4 as uuid } from 'uuid'
import Link from '../model/Link'
import Post from '../model/Post'
import User from '../model/User'
import UserCollect from '../model/UserCollect'


class ContentController {
  async getPostList (ctx) {
    const { body } = ctx.request
    console.log('body:', body)
    const options = {}
    if (body.isTop !== '' && body.isTop) {
      options.isTop = body.isTop
    }
    if (body.status !== '' && body.status) {
      options.status = body.status
    }
    if (body.catalog !== '' && body.catalog) {
      options.catalog = body.catalog
    }
    if (body.tag !== '' && body.tag) {
      options.tags = { $elemMatch: { name: body.tag } }
    }
    // if (body.isEnd !== '' && body.isEnd !== 'undefined') {
    //   options.isEnd = body.isEnd
    // }

    const sort = body.sort ? body.sort : 'created'
    const page = body.page ? parseInt(body.page) : 0
    const limit = body.limit ? parseInt(body.limit) : 20
    const result = await Post.getList(options, sort, page, limit)
    const counts = await Post.queryCount(options)
    ctx.body = {
      code: 200,
      data: result,
      total: counts,
      msg: '获取列表成功'
    }
  }

  async getAllLinks (ctx) {
    // 向数据库添加测试数据
    // const link = new Link({
    //   title: '中欧世界第三次大战',
    //   link: 'https://www.baidu/com',
    //   type: 'link',
    //   isTop: '0',
    //   sort: '0'
    // })
    // const saveRet = link.save()
    // console.log('🚀 ~ file: Links.js ~ line 20 ~ saveRet', saveRet)
    const result = await Link.find({ type: 'link' })
    ctx.body = {
      code: 200,
      data: result,
      msg: '获取友链成功'
    }
  }

  async getTips (ctx) {
    // 向数据库添加测试数据
    // const link = new Link({
    //   title: '中欧世界第三次大战',
    //   link: 'https://www.baidu/com',
    //   type: 'tip',
    //   isTop: '0',
    //   sort: '0'
    // })
    // const saveRet = link.save()
    // console.log('🚀 ~ file: Links.js ~ line 20 ~ saveRet', saveRet)
    const result = await Link.find({ type: 'tip' })
    ctx.body = {
      code: 200,
      data: result,
      msg: '获取温馨提醒成功'
    }
  }

  // 获取本周热议
  async getTopWeek (ctx) {
    const result = await Post.getTopWeek()
    ctx.body = {
      code: 200,
      data: result,
      msg: '获取本周热议成功'
    }
  }

  // 上传图片
  async uploadImg (ctx) {
    console.log('🚀 ~ file: ContentController.js ~ line 108 ~ ContentController ~ uploadImg ~ ctx', ctx)
    const file = ctx.request.files.file
    const ext = file.name.split('.').pop()
    const dir = `${config.uploadPath}/${moment().format('YYYYMMDD')}`

    // 判断路径是否存在 , 不存在则创建
    // 手写文件目录判断及创建方法
    // const result = await dirExists(dir)

    // 引用 make-dir 第三方依赖包实现创建目标文件目录
    await mkdir(dir)
    // 存储文件到制定路径

    // 给文件一个唯一的名称
    const picname = uuid()
    const destPath = `${dir}/${picname}.${ext}`
    const reader = fs.createReadStream(file.path)
    const upStream = fs.createWriteStream(destPath)
    const filePath = `/${moment().format('YYYYMMDD')}/${picname}.${ext}`

    // 第一种方法
    reader.pipe(upStream)

    // 第二种方法，节约内存 使用fs文件读取流
    // let totalLength = 0

    // reader.on('data', (chunk) => {
    //   totalLength += chunk.length
    //   console.log('🚀 ~ file: ContentController.js ~ line 132 ~ ContentController ~ uploadImg ~ totalLength', totalLength)
    //   if (upStream.write(chunk) === false) {
    //     reader.pause()
    //   }
    // })

    // reader.on('drain', () => {
    //   reader.resume()
    // })

    // reader.on('end', () => {
    //   upStream.end()
    // })

    ctx.body = {
      code: 200,
      msg: '头像上传成功',
      data: filePath
    }
  }

  async addPost (ctx) {
    const { body } = ctx.request
    const sid = body.sid
    const code = body.code
    // 2.验证图片验证码
    const checkCode = await CheckCode(sid, code)
    if (checkCode) {
      // 取用户的ID
      const obj = await getJWTPayload(ctx.header.authorization)
      const user = await User.findByID(obj.id)

      if (user.favs < body.fav) {
        ctx.body = {
          code: 401,
          msg: '抱歉，您的剩余积分不足'
        }
        return
      }
      const favResult = await User.updateOne({ _id: obj.id }, { $inc: { favs: -body.fav } })
      const post = new Post({
        title: body.title,
        catalog: body.catalog,
        fav: body.fav,
        content: body.content
      })
      post.uid = obj.id
      const result = await post.save()
      ctx.body = {
        code: 200,
        msg: '发帖成功',
        data: result,
        fav: favResult
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '验证码校验失败，请核对后重新输入'
      }
    }
  }

  async updatePost (ctx) {
    const { body } = ctx.request
    const sid = body.sid
    const code = body.code
    // 2.验证图片验证码
    const checkCode = await CheckCode(sid, code)
    if (checkCode) {
      // 取用户的ID
      // const obj = await getJWTPayload(ctx.header.authorization)
      const result = await Post.updateOne({ _id: body.tid }, body)
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
    } else {
      ctx.body = {
        code: 500,
        msg: '验证码校验失败'
      }
    }
  }

  async getPostDetail (ctx) {
    const body = ctx.request.query
    const post = await Post.getPostById(body.tid)
    await Post.updateOne({ _id: body.tid }, { $inc: { reads: 1 } })

    const result = rename(post.toJSON(), 'uid', 'user')
    // 用户登陆才进行查询
    if (ctx.header.authorization) {
      const obj = await getJWTPayload(ctx.header.authorization)
      const arrayData = await UserCollect.find({
        uid: obj.id,
        tid: body.tid
      })
      if (arrayData.length > 0) {
        result.isFav = true
      } else {
        result.isFav = false
      }
    }

    ctx.body = {
      code: 200,
      data: result,
      msg: '获取帖子详细信息成功'
    }
  }

  async getPostListByUid (ctx) {
    const { body } = ctx.request
    // 验证用户名密码
    const result = await Post.getListByUid(body.uid)
    ctx.body = {
      code: 200,
      data: result,
      msg: '查询成功'
    }
  }

  async userCollect (ctx) {
    const { body } = ctx.request
    // 验证用户名密码
    const userCollect = new UserCollect({
      tid: body.tid,
      uid: body.uid,
      title: body.title
    })

    const arrayData = await UserCollect.find({
      uid: body.uid,
      tid: body.tid
    }).sort({ created: -1 })
    if (arrayData.length > 0) {
      ctx.body = {
        code: 500,
        msg: '已收藏，请勿重复收藏'
      }
      return
    }

    const result = await userCollect.save()
    ctx.body = {
      code: 200,
      msg: '收藏成功',
      data: result
    }
  }

  async removeCollect (ctx) {
    const { body } = ctx.request
    const result = await UserCollect.deleteOne({
      uid: body.uid,
      tid: body.tid
    })
    ctx.body = {
      code: 200,
      msg: '删除成功',
      data: result
    }
  }

  async getUserCollect (ctx) {
    const { body } = ctx.request
    const result = await UserCollect.find({
      uid: body.uid
    }).sort({ created: -1 })
    ctx.body = {
      code: 200,
      msg: '查询收藏列表成功',
      data: result
    }
  }
}

export default new ContentController()
