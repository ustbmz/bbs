import Dispatch from '../libs/dispatch'

// 获取用户列表
export const blogDispatch = new Dispatch({
  get: ['/public/getMDS', 'post'],
  update: ['/public/updateMD', 'post'],
  delete: ['/public/deleteMD', 'post'],
  add: ['/public/addMD', 'post']
})
