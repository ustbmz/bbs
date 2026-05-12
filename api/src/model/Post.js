import mongoose from '../config/DBHelper'
import moment from 'dayjs'
const PostSchema = mongoose.Schema({
  uid: { type: String, ref: 'users' },
  title: { type: String },
  content: { type: String },
  created: { type: Date },
  catalog: { type: String },
  fav: { type: Number },
  isEnd: { type: String, default: '0' },
  reads: { type: Number, default: 0 },
  answer: { type: Number, default: 0 },
  status: { type: String, default: '0' },
  isTop: { type: String, default: '0' },
  sort: { type: String, default: '0' },
  tags: { type: Array, default: [] }
})

PostSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

PostSchema.statics = {
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
      .sort({ [sort]: -1 })
      .skip(page * limit)
      .populate({
        path: 'uid',
        select: 'name isVip pic'
      })
  },

  queryCount: function (options) {
    return this.find(options).countDocuments()
  },

  getTopWeek: function () {
    return this.find({
      created: {
        $gte: moment().subtract(7, 'days')
      }
    }, {
      answer: 1,
      title: 1
    }).sort({ answer: -1 })
      .limit(15)
  },

  getPostById: function (id) {
    return this.findOne({
      _id: id
    }).populate({
      path: 'uid',
      select: 'name pic isVip _id'
    })
  },

  getListByUid: function (uid) {
    return this.find({ uid: uid })
  },

  getHotPost: function (start, end, limit, page) {
    console.log('🚀 ~ file: Post.js ~ line 75 ~ end', end)
    console.log('🚀 ~ file: Post.js ~ line 75 ~ start', start)
    let query = {}
    if (start !== '') {
      query = { created: { $gte: start, $lt: end } }
    }
    return this.find(query)
      .skip(limit * page)
      .limit(limit)
      .sort({ answer: -1 })
  }
}

const PostModel = mongoose.model('posts', PostSchema)

export default PostModel
