import mongoose from '../config/DBHelper'
import moment from 'dayjs'

const UserSchema = mongoose.Schema({
  username: { type: String, index: { unique: true }, sparse: true },
  password: { type: String },
  name: { type: String },
  created: { type: Date },
  updated: { type: Date },
  favs: { type: Number, default: 100 },
  gender: { type: String, default: '' },
  roles: { type: Array, default: ['user'] },
  pic: { type: String, default: '/img/header.jpg' },
  moblie: { type: String, default: '' },
  status: { type: String, default: '0' },
  regmark: { type: String, default: '' },
  localtion: { type: String, default: '' },
  isVip: { type: String, default: '0' },
  count: { type: Number, default: 0 }
})

UserSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})
UserSchema.pre('update', function (next) {
  this.updated = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

UserSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Error : mongoose has a duplicate key'))
  } else {
    next(error)
  }
})

UserSchema.statics = {
  findByID: function (id) {
    // 返回参数排除password
    return this.findOne(
      { _id: id },
      {
        password: 0
      }
    )
  },
  getHotSign: function (index, limit, page) {
    return this.find().skip(limit * page).limit(limit).sort({ count: -1 })
  },
  getTotalHotSign: function (index, limit, page) {
    return this.find().countDocuments()
  }

}

const UserModel = mongoose.model('users', UserSchema)

export default UserModel
