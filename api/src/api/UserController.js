import { getJWTPayload } from '@/common/Utils'
import Comments from '@/model/Comments'
import SignRecord from '@/model/SingRecord'
import User from '@/model/User'
import bcrypt from 'bcrypt'
import moment from 'dayjs'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import config from '../config/index'
import send from '../config/MailConfig'
import { getValue, setValue } from '../config/RedisConfig.js'

class UserController {
  // async userSign (ctx) {
  //   let result = {}
  //   const obj = await getJWTPayload(ctx.header.authorization)
  //   const record = SignRecordModel.findById(obj.id)
  //   console.log('🚀 ~ file: UserController.js ~ line 11 ~ UserController ~ userSign ~ record', record)
  //   const user = UserModel.findById(obj.id)
  //   console.log('🚀 ~ file: UserController.js ~ line 12 ~ UserController ~ userSign ~ user', user)
  //   const count = user.count
  //   console.log('🚀 ~ file: UserController.js ~ line 15 ~ UserController ~ userSign ~ count', count)

  //   let fav = 0

  //   if (record !== null) {
  //     console.log('hasrecord:', record)
  //     // 用户已存在签到信息
  //     if (moment(record.created).format('YYYY-MM-DD') === moment(user.lastsign).format('YYYY-MM-DD')) {
  //       // 今日已签到
  //       ctx.body = {
  //         code: 500,
  //         msg: '用户已签到',
  //         fav: user.fav,
  //         count: count
  //       }
  //     } else {
  //       // 有签到信息且最后签到日期不是今天
  //       if (moment(user.lastsign).format('YYYY-MM-DD') === moment().subtract(1, 'days').format('YYYY-MM-DD')) {
  //         // 进入连续签到
  //         if (count <= 5) {
  //           fav = 5
  //         } else if (count > 5 && count <= 15) {
  //           fav = 10
  //         } else if (count > 15 && count <= 30) {
  //           fav = 15
  //         } else if (count > 30 && count <= 100) {
  //           fav = 20
  //         } else if (count > 100 && count <= 360) {
  //           fav = 30
  //         } else {
  //           fav = 50
  //         }
  //         await UserModel.updateOne({
  //           _id: obj.id
  //         }, {
  //           $inc: { count: 1, fav: fav }
  //         })
  //         result = {
  //           count: count + 1,
  //           fav: user.fav + fav
  //         }
  //       } else {
  //         // 用户漏签到，积分规则重制
  //         fav = 5
  //         await UserModel.updateOne({
  //           _id: obj.id
  //         }, {
  //           $inc: { count: 1, fav: fav }
  //         })
  //         result = {
  //           count: count + 1,
  //           fav: user.fav + fav
  //         }
  //       }
  //     }
  //     const singrecord = new SignRecordModel({
  //       uid: obj.id,
  //       favs: fav,
  //       lastsign: moment().format('YYYY-MM-DD HH:mm:ss')
  //     })
  //     await singrecord.save()
  //   } else {
  //     // 无签到数据
  //     await UserModel.updateOne({
  //       _id: obj.id
  //     }, {
  //       $set: { count: 1 },
  //       $inc: { fav: 5 }
  //     })
  //     const singRecord = new SignRecordModel({
  //       uid: obj.id,
  //       favs: 5,
  //       lastsign: moment().format('YYYY-MM-DD HH:mm:ss')
  //     })

  //     const resultSave = await singRecord.save()
  //     console.log('🚀 ~ file: UserController.js ~ line 91 ~ UserController ~ userSign ~ resultSave', resultSave)
  //     result = {
  //       count: 1,
  //       fav: 5
  //     }
  //   }
  //   ctx.body = {
  //     code: 200,
  //     msg: '签到成功',
  //     ...result
  //   }
  // }

  // 用户签到接口
  async userSign (ctx) {
    // 取用户的ID
    const obj = await getJWTPayload(ctx.header.authorization)
    // 查询用户上一次签到记录
    const record = await SignRecord.findByUid(obj.id)
    const user = await User.findByID(obj.id)
    console.log('===========record.created=============')
    console.log(record.created)
    console.log('===========record.created=============')

    let newRecord = {}
    let result = ''
    // 判断签到逻辑
    if (record !== null && typeof record.created !== 'undefined') {
      // 有历史的签到数据
      // 判断用户上一次签到记录的created时间是否与今天相同
      // 如果当前时间的日期与用户上一次的签到日期相同，说明用户已经签到
      if (
        moment(record.created).format('YYYY-MM-DD') ===
        moment().format('YYYY-MM-DD')
      ) {
        ctx.body = {
          code: 500,
          data: {
            favs: user.favs,
            count: user.count,
            lastSign: record.created
          },
          msg: '用户已经签到'
        }
        return
      } else {
        // 有上一次的签到记录，并且不与今天相同，进行连续签到的判断
        // 如果相同，代表用户是在连续签到
        let count = user.count
        let fav = 0
        // 判断签到时间: 用户上一次的签到时间等于，当前时间的前一天，说明，用户在连续签到
        // 第n+1天签到的时候，需要与第n的天created比较
        if (
          moment(record.created).format('YYYY-MM-DD') ===
          moment()
            .subtract(1, 'days')
            .format('YYYY-MM-DD')
        ) {
          // 连续签到的积分获得逻辑
          count += 1
          if (count < 5) {
            fav = 5
          } else if (count >= 5 && count < 15) {
            fav = 10
          } else if (count >= 15 && count < 30) {
            fav = 15
          } else if (count >= 30 && count < 100) {
            fav = 20
          } else if (count >= 100 && count < 365) {
            fav = 30
          } else if (count >= 365) {
            fav = 50
          }
          await User.updateOne(
            { _id: obj.id },
            {
              // user.favs += fav
              // user.count += 1
              $inc: { favs: fav, count: 1 }
            }
          )
          result = {
            favs: user.favs + fav,
            count: user.count + 1
          }
        } else {
          // 用户中断了一次签到
          // 第n+1天签到的时候，需要与第n的天created比较，如果不相等，说明中断了签到。
          fav = 5
          await User.updateOne(
            { _id: obj.id },
            {
              $set: { count: 1 },
              $inc: { favs: fav }
            }
          )
          result = {
            favs: user.favs + fav,
            count: 1
          }
        }
        // 更新签到记录
        newRecord = new SignRecord({
          uid: obj.id,
          favs: fav
        })
        await newRecord.save()
      }
    } else {
      // 无签到数据 =》 第一次签到
      // 保存用户的签到数据，签到记数 + 积分数据
      await User.updateOne(
        {
          _id: obj.id
        },
        {
          $set: { count: 1 },
          $inc: { favs: 5 }
        }
      )
      // 保存用户的签到记录
      newRecord = new SignRecord({
        uid: obj.id,
        favs: 5
      })
      await newRecord.save()
      result = {
        favs: user.favs + 5,
        count: 1
      }
    }
    ctx.body = {
      code: 200,
      msg: '请求成功',
      data: { ...result },
      lastSign: newRecord.created
    }
  }

  // 用户更新基本信息接口
  async updateUserInfo (ctx) {
    // 取用户的ID
    const { body } = ctx.request
    const obj = await getJWTPayload(ctx.header.authorization)
    const user = await User.findOne({ _id: obj.id })
    let msg = ''
    const key = uuid()
    const token = jwt.sign({ id: obj.id }, config.JWT_SECRET, {
      expiresIn: '1d'
    })
    setValue(key, token)
    if (body.username && body.username !== user.username) {
      // 用户要更新邮箱，需要发送验证邮件
      const result = await send({
        type: 'reset',
        data: {
          key: key,
          username: body.username
        },
        expire: moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
        email: user.username,
        user: 'User',
        name: user.name
      })

      console.log(result)

      msg = '邮件已发送，请点击重置邮箱链接进行更改'
      ctx.body = {
        code: 501,
        msg: msg
      }
    }
    const arr = ['username', 'password', 'mobile']
    arr.forEach((item) => {
      delete body[item]
    })
    const result = await User.updateOne({ _id: obj.id }, {
      name: body.name,
      localtion: body.localtion,
      regmark: body.regmark,
      pic: body.pic
    })
    if (result.n === 1 && result.ok === 1) {
      ctx.body = {
        code: 200,
        msg: msg === '' ? '用户数据更新成功' : msg
      }
    } else {
      ctx.body = {
        code: 500,
        msg: msg === '' ? '用户数据更新失败' : msg
      }
    }
  }

  async resetEamil (ctx) {
    const body = ctx.query
    if (body.key) {
      const token = await getValue(body.key)
      const obj = await getJWTPayload('Baerer ' + token)
      await User.updateOne({ _id: obj.id }, { username: body.username })
      ctx.body = {
        code: 200,
        msg: '用户邮箱已重置成功，请使用新邮箱进行登陆'
      }
    }
  }

  async resetPasswd (ctx) {
    const { body } = ctx.request
    if (body.username) {
      const password = await bcrypt.hash(body.password, 5)
      await User.updateOne({ username: body.username }, { password: password })
      ctx.body = {
        code: 200,
        msg: '密码重置成功'
      }
    }
  }

  async updatePassword (ctx) {
    const { body } = ctx.request
    // 验证用户名密码
    let CheckPassWord = false
    const user = await User.findOne({ username: body.username })
    if (await bcrypt.compare(body.password, user.password)) {
      CheckPassWord = true
    }
    if (CheckPassWord) {
      const password = await bcrypt.hash(body.newpassword, 5)
      await User.updateOne({ username: body.username }, { password: password })
      ctx.body = {
        code: 200,
        msg: '密码修改成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '原密码错误，请重新输入'
      }
    }
  }

  async getMsg (ctx) {
    const obj = await getJWTPayload(ctx.header.authorization)
    const result = await Comments.find({ uid: obj.id, cuid: { $ne: obj.id }, isRead: { $eq: '0' } })
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
      }).sort({ created: -1 })

    ctx.body = {
      code: 200,
      data: result,
      msg: '查询成功'
    }
  }

  async readAllMsg (ctx) {
    const obj = await getJWTPayload(ctx.header.authorization)
    const result = await Comments.readAllMsg(obj.id)
    ctx.body = {
      code: 200,
      data: result,
      msg: '所有消息已读'
    }
  }

  async readOneMsg (ctx) {
    const { body } = ctx.request
    const result = await Comments.updateOne({ _id: body.id }, { isRead: '1' })
    ctx.body = {
      code: 200,
      data: result,
      msg: '消息已读'
    }
  }
}

export default new UserController()
