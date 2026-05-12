import { axios } from '@/libs/request'

// 内容管理 -> 文章管理
const getList = (options) => {
  return axios.post('/admin/lists', {
    ...options
  })
}

const deletePostById = (ids) => {
  return axios.post('/admin/content/delete', { id: ids })
}

const updatePostById = (data) => {
  return axios.post('/admin/content/updateId', data)
}

const updatePostBatchById = (data) => {
  return axios.post('/admin/content/updatePostSettings', data)
}

// 内容管理 -> 标签管理
const addTag = (data) => {
  return axios.post('/admin/addTag', data)
}
const getTags = (options) => {
  return axios.post('/admin/getTags', options)
}
// 友链管理
const getLinks = (options) => {
  return axios.post('/admin/getLinks', options)
}
const addLink = (data) => {
  return axios.post('/admin/addLink', data)
}
const updateLink = (data) => {
  return axios.post('/admin/updateLink', data)
}
const delLink = (data) => {
  return axios.post('/admin/delLink', data)
}

const removeTag = (id) => {
  return axios.get('/admin/removeTag?ptid=' + id)
}

const updateTag = (data) => {
  return axios.post('/admin/editTag?', data)
}

export {
  getList,
  deletePostById,
  updatePostById,
  getTags,
  getLinks,
  addLink,
  updateLink,
  delLink,
  addTag,
  removeTag,
  updateTag,
  updatePostBatchById
}
