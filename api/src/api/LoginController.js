import send from '../config/MailConfig'
import moment from 'dayjs'
import bcrypt from 'bcrypt'
import { CheckCode } from '../common/Utils'
import jwt from 'jsonwebtoken'
import User from '../model/User'
import config from '../config/index'
import signRecord from '../model/SingRecord'

/* eslint-disable */
class LoginController {
  async forgot (ctx) {
    const { body } = ctx.request
    try {
      const result = await send({
        code: '1234',
        expire: moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
        email: body.username,
        data: {
          username: body.username
        },
        user: 'User'
      })
      ctx.body = {
        code: 200,
        data: result,
        msg: '邮件发送成功'
      }
    } catch (e) {
      console.log(e)
    }
  }

  async login (ctx) {
    // 1.接受数据
    const { body } = ctx.request
    const sid = body.sid
    const code = body.code
    // 2.验证图片验证码
    if (await CheckCode(sid, code)) {
      // 3.验证用户名密码
      let CheckPassWord = false
      const user = await User.findOne({ username: body.username })
      if (user === null || user === "") {
        ctx.body = {
          code: 400,
          msg: '无此用户'
        }
        return 
      }
      const userObj = user.toJSON()
      console.log('user.password:', user.password)
      console.log('userObj._id:', userObj._id)
      const arr = ['password', 'role']
      arr.forEach((item) => {
        delete userObj[item]
      })
      if (await bcrypt.compare(body.password, user.password)) {
        CheckPassWord = true
      }
      if (CheckPassWord) {
        const token = jwt.sign({ id: userObj._id }, config.JWT_SECRET, {
          expiresIn: '1d'
        })

        const record = signRecord.findByUid(userObj._id)
        console.log('record.created:', record.created)


        if (record !== null && typeof record.created !== 'undefined') {
          if (moment(record.created).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
            userObj.isSign = true
            userObj.lastSign = record.created
          } else {
            userObj.isSign = false
          }
        } else {
          userObj.isSign = false
        }
        ctx.body = {
          code: 200,
          data: userObj,
          token: token
        }
      } else {
        ctx.body = {
          code: 400,
          msg: '密码错误'
        }
      }
    } else {
      ctx.body = {
        code: 401,
        msg: '图片验证码错误，请重试'
      }
    }
    // 4.返回token
  }

  async reg (ctx) {
    console.log('user reg')
    // 1.接受数据
    const { body } = ctx.request
    const sid = body.sid
    const code = body.code

    const result = await CheckCode(sid, code)
    // 2.验证图片验证码
    if (result) {
      if (
        !body.password ||
        typeof body.password !== 'string' ||
        body.password.length < 6 ||
        body.password.length > 16
      ) {
        ctx.body = {
          code: 400,
          msg: '密码长度为 6～16 个字符'
        }
        return
      }
      try {
        const userExist = await User.findOne({ username: body.username })
        if (userExist !== null && typeof userExist.username !== 'undefined') {
          ctx.body = {
            code: 400,
            msg: '此邮箱已注册，可以通过邮箱找回密码'
          }
          return
        }
        const nameExist = await User.findOne({ name: body.name })
        if (nameExist !== null && typeof nameExist.name !== 'undefined') {
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
          create: moment().format('YYYY-MM-DD hh:mm:ss')
        })
        const saveResult = await newUser.save()
        ctx.body = {
          code: 200,
          msg: '注册成功',
          data: saveResult
        }
      } catch (e) {
        console.error(e)
        if (e.name === 'MongoError' && e.code === 11000) {
          ctx.body = {
            code: 400,
            msg: '用户名或昵称已被占用'
          }
          return
        }
        ctx.body = {
          code: 503,
          msg: '数据库不可用，请确认 MongoDB 已启动且连接配置正确'
        }
      }
    } else {
      ctx.body = {
        code: 401,
        msg: '图片验证码错误，请重试'
      }
    }
  }
}

export default new LoginController()
