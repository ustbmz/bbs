import mongoose from '@/config/DBHelper'
import moment from 'dayjs'

const SignRecordSchema = mongoose.Schema({
  uid: { type: String },
  created: { type: Date },
  favs: { type: Number }
})

SignRecordSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

SignRecordSchema.statics = {
  findByUid: function (id) {
    return this.find({ uid: '60cf181b40a9b826a49ae1f7' }).sort({ created: -1 })
  }
}

// Schema 于 mongoose 进行对应
const SignRecordModel = mongoose.model('sign_record', SignRecordSchema, 'sign_record')

export default SignRecordModel
