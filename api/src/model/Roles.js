import mongoose from '../config/DBHelper'

const RoleSchema = mongoose.Schema({
  name: { type: 'String', default: '' },
  role: { type: 'String', default: '' },
  desc: { type: 'String', default: '' },
  menu: { type: 'Array', default: [] }
})

const Roles = mongoose.model('roles', RoleSchema)

export default Roles
