import mongoose from '../config/DBHelper'

const TagSchema = mongoose.Schema({
  tagName: { type: String },
  tagClass: { type: String }
})

const TagModel = mongoose.model('tags', TagSchema)

export default TagModel
