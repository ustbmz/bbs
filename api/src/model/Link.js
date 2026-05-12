import mongoose from '../config/DBHelper'
import moment from 'dayjs'

const LinksSchema = mongoose.Schema({
  title: { type: String },
  link: { type: String },
  type: { type: String, default: 'link' },
  isTop: { type: String },
  created: { type: String },
  sort: { type: String }
})

LinksSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

const LinksModel = mongoose.model('links', LinksSchema)

export default LinksModel
