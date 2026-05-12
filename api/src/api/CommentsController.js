import Comments from '@/model/Comments'
import CommentsHand from '@/model/CommentsHand'
import Post from '@/model/Post'
import User from '@/model/User'
import { CheckCode, getJWTPayload } from '../common/Utils'

/** *****
   * @description: 查询用户状态
   * @param  {Object} ctx 请求报文
   * @return {Boolean} return
   */
const checkUser = async (ctx) => {
  const obj = await getJWTPayload(ctx.header.authorization)
  if (typeof obj !== 'undefined' && obj.id !== '') {
    const user = await User.findOne({ _id: obj.id })
    if (user.status === '0') {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}
class CommentsControlls {
  async getCommentsByTid (ctx) {
    const option = ctx.query
    const result = await Comments.getCommentsById(option.tid)
    const total = await Comments.queryCount(option.tid)
    ctx.body = {
      code: 200,
      total: total,
      data: result,
      msg: '获取评论信息成功'
    }
  }

  async addComments (ctx) {
    const { body } = ctx.request
    const sid = body.sid
    const code = body.code
    // 2.验证图片验证码
    const checkCode = await CheckCode(sid, code)
    if (!checkCode) {
      ctx.body = {
        code: 500,
        msg: '验证码验证失败，请重试'
      }
    }
    const post = await Post.findOne({ _id: body.tid })
    const obj = await getJWTPayload(ctx.header.authorization)
    body.cuid = obj.id
    body.uid = post.uid

    const comment = new Comments(body)
    const result = await comment.save()

    // 获取作者未读评论信息，如果用户在线,发送通知消息
    const counts = await Comments.getNoReadCount(post.uid)
    global.ws.send(post.uid, JSON.stringify({
      event: 'message',
      message: counts
    }))
    await Post.updateOne({ _id: body.tid }, { $inc: { answer: 1 } })

    ctx.body = {
      code: 200,
      data: result,
      msg: '评论添加成功'
    }
  }

  async updateComment (ctx) {
    const { body } = ctx.request
    const sid = body.sid
    const code = body.code
    // 2.验证图片验证码
    const checkCode = await CheckCode(sid, code)
    if (!checkCode) {
      ctx.body = {
        code: 500,
        msg: '验证码验证失败，请重试'
      }
    }
    const result = await Comments.updateOne({ _id: body.cid }, { $set: body })
    ctx.body = {
      code: 200,
      data: result,
      msg: '评论信息更新成功'
    }
  }

  async editComment (ctx) {
    const check = await checkUser(ctx)
    if (!check) {
      ctx.body = {
        code: 401,
        msg: '用户禁言状态，请联系管理员'
      }
    }
    const { body } = ctx.request
    const sid = body.sid
    const code = body.code
    // 2.验证图片验证码
    const checkCode = await CheckCode(sid, code)
    if (!checkCode) {
      ctx.body = {
        code: 500,
        msg: '验证码验证失败，请重试'
      }
    }
    const result = await Comments.updateOne({ _id: body.cid }, { content: body.content })
    ctx.body = {
      code: 200,
      data: result,
      msg: '评论更新成功'
    }
  }

  async bestComment (ctx) {
    const check = checkUser(ctx)
    if (!check) {
      ctx.body = {
        code: 401,
        msg: '用户禁言状态，请联系管理员'
      }
    }
    const { body } = ctx.request
    // 更新评论表采纳状态
    const result = await Comments.updateOne({ _id: body.cid }, { isBest: '1' })
    // 更新帖子结贴状态
    const result1 = await Post.updateOne({ _id: body.pid }, { isEnd: '1' })
    // 更新用户积分
    ctx.body = {
      code: 200,
      data: { ...result, ...result1 },
      msg: '采纳成功'
    }
  }

  async addHand (ctx) {
    const check = checkUser(ctx)
    if (!check) {
      ctx.body = {
        code: 401,
        msg: '用户禁言状态，请联系管理员'
      }
    }
    const { body } = ctx.request
    const chand = new CommentsHand({
      cid: body.cid,
      uid: body.uid
    })
    // 判断是否已点赞
    const tmp = await CommentsHand.find({ cid: body.cid, uid: body.uid })
    if (tmp.length > 0) {
      ctx.body = {
        code: 401,
        msg: '您已经点赞，请勿重复点赞'
      }
      return
    }

    await chand.save()
    // 更新评论表采纳状态
    const result = await Comments.updateOne({ _id: body.cid }, { $inc: { hands: 1 } })
    if (result.ok === 1) {
      // 更新用户积分
      ctx.body = {
        code: 200,
        msg: '点赞成功'
      }
    } else {
      ctx.body = {
        code: 200,
        msg: '点赞失败'
      }
    }
  }
}

export default new CommentsControlls()
