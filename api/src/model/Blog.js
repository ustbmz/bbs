import moment from 'dayjs'
import mongoose from '../config/DBHelper'

const BlogSchema = mongoose.Schema({
  author: { type: String },
  title: { type: String },
  content: { type: String },
  created: { type: Date },
  type: { type: String },
  isEnd: { type: String, default: '0' },
  reads: { type: Number, default: 0 },
  status: { type: String, default: '0' },
  sort: { type: String, default: '0' }
})

BlogSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

BlogSchema.statics = {
  /**
   * @description: 获取帖子列表
   * @param {Object} options 传入参数
   * @param {String} sort 排序方式
   * @param {Number} page 分页页数
   * @param {Number} limit 分页条数
   * @return {Json}
  */
  getList (options, sort, page, limit) {
    console.log('options is:', options)

    return this.find(options)
      .sort({ created: -1 })
      .skip(page * limit)
  },

  queryCount: function (options) {
    return this.find(options).countDocuments()
  },

  getPostById: function (id) {
    return this.findOne({
      _id: id
    }).populate({
      path: 'uid',
      select: 'name pic isVip _id'
    })
  }
}

const PostModel = mongoose.model('blog', BlogSchema)

export default PostModel
