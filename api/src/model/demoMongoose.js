import User from './User'

// const user = {
//   username: 'test',
//   password:'test'
// }

const FindUserMethod = async () => {
  const result = await User.findOne({ username: 'cnmz@msn.com' })
  console.log(result.username)
}

// 新增
// const insertMethods = async () => {
//   const data = new User(user)
//   const result = await data.save()
//   console.log(result);
// }

// 查询
// const findMethods = async () => {
//   const result = await User.find()
//   console.log(result)
// }

// 更新
// const updateMethods = async () => {
//   const result = await User.updateOne({name:'test'},{email:"update@163.com"})
//   console.log(result)
// }

// 删除

// const deleteMethods = async () => {
//   const result = await User.deleteOne({ name: 'test' })
//   console.log(result)
// }

FindUserMethod()
