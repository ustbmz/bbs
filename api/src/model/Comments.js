import mongoose from '../config/DBHelper'
import moment from 'dayjs'

const CommentsSchema = mongoose.Schema({
  tid: { type: String, ref: 'posts' },
  uid: { type: String, ref: 'users' },
  cuid: { type: String, ref: 'users' },
  content: { type: String },
  created: { type: Date },
  hands: { type: Number, default: 0 },
  status: { type: String, default: '1' },
  isRead: { type: String, default: '0' },
  isBest: { type: String, default: '0' }
})

CommentsSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

CommentsSchema.statics = {

  getCommentsById: function (id) {
    return this.find({
      tid: id
    }).populate({
      path: 'cuid',
      select: 'name pic isVip',
      match: { status: { $eq: '0' } }
    })
  },

  queryCount: function (id) {
    return this.find({ tid: id }).countDocuments()
  },

  getCommentsPublic: function (id) {
    return this.find({
      cuid: id
    }).populate({
      path: 'tid',
      select: '_id title'
    })
  },

  getNoReadCount: function (id) {
    return this.find({ uid: id, isRead: '0', status: '1' }).countDocuments()
  },

  readAllMsg: function (id) {
    return this.updateMany({ uid: id }, { $set: { isRead: '1' } })
  },

  getHotComments: function (index, limit, page) {
    if (index === '0') {
      // 匹配30天内的评论数据
      return this.aggregate([
        { $match: { created: { $gte: new Date(moment().subtract(30, 'day')) } } },
        { $group: { _id: '$cuid', count: { $sum: 1 } } },
        { $addFields: { userId: { $toObjectId: '$_id' } } },
        { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'cuid' } },
        { $unwind: '$cuid' },
        { $project: { cuid: { name: 1, _id: 1, pic: 1 }, count: 1 } },
        { $skip: page * limit },
        { $limit: limit },
        { $sort: { count: -1 } }

        // { $match: { created: { $gte: new Date(moment().subtract(30, 'day')) } } },
        // { $group: { _id: '$cuid', count: { $sum: 1 } } },
        // { $addFields: { userId: { $toObjectId: '$_id' } } },
        // { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'cuid' } },
        // { $unwind: '$cuid' },
        // { $project: { cuid: { name: 1, _id: 1, pic: 1 }, count: 1 } },
        // { $skip: page * limit },
        // { $limit: limit },
        // { $sort: { count: -1 } }
      ])
    } else {
      return this.find()
        .populate({
          path: 'cuid',
          select: 'name pic _id'
        })
        .skip(limit * page)
        .limit(limit)
        .sort({ created: -1 })
    }
  }
}

const PostModel = mongoose.model('comments', CommentsSchema, 'comments')

export default PostModel
