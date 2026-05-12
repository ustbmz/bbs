import mongoose from '../config/DBHelper'
import moment from 'dayjs'

const CommentsHandSchema = mongoose.Schema({
  cid: { type: String, ref: 'comments' },
  uid: { type: String, ref: 'users' },
  created: { type: Date }
})

CommentsHandSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

CommentsHandSchema.statics = {

  /** *****
   * @description: 获取点赞信息
   * @param {*} id
   * @return {*}
   */
  findByCid: function (cid) {
    return this.findOne({
      cid: cid
    })
  }
}

const PostModel = mongoose.model('comments_hand', CommentsHandSchema, 'comments_hand')

export default PostModel
