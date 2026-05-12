import mongoose from '../config/DBHelper'
import moment from 'dayjs'

const UserCollectSchema = mongoose.Schema({
  tid: { type: String, ref: 'post' },
  uid: { type: String, ref: 'users' },
  title: { type: String },
  created: { type: Date }
})

UserCollectSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

UserCollectSchema.statics = {

  getUserCollectById: function (id) {
    return this.find({
      uid: id
    })
  },

  queryCount: function (id) {
    return this.find({ uid: id }).countDocuments()
  }
}

const UserCollectModel = mongoose.model('user_collect', UserCollectSchema, 'user_collect')

export default UserCollectModel
