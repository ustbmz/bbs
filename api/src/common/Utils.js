import { getValue } from '../config/RedisConfig'
import config from '../config/index'
import jwt from 'jsonwebtoken'
import path from 'path'
import fs from 'fs'

const getJWTPayload = (token) => {
  console.log(token.split(' ')[1])
  console.log('> getJWTPayload -- verify:', jwt.verify(token.split(' ')[1], config.JWT_SECRET))
  return jwt.verify(token.split(' ')[1], config.JWT_SECRET)
}

const CheckCode = async (key, value) => {
  const redisData = await getValue(key)
  if (redisData !== null) {
    console.log('redisData.toLowerCase()' + redisData.toLowerCase())
    console.log('value.toLowerCase()' + value.toLowerCase())
    if (redisData.toLowerCase() === value.toLowerCase()) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

const getStats = async (path) => {
  return new Promise((resolve) => {
    fs.stat(path, (err, stats) => err ? resolve(false) : resolve(stats))
  })
}

// 创建目录
const mkdir = (dir) => {
  return new Promise((resolve) => {
    fs.mkdir(dir, err => err ? resolve(false) : resolve(true))
  })
}

// 如果上级目录不存在，则创建上级目录
const dirExists = async (dir) => {
  const isExists = await getStats(dir)
  console.log('🚀 ~ file: Utils.js ~ line 44 ~ dirExist ~ isExists', isExists)
  // 如果该目录存在，且不是文件
  if (isExists && isExists.isDirectory) {
    return true
  } else if (isExists) {
    // 路径存在，但是是文件
    return false
  }

  // 如果该路径不存在，则创建这个目录
  const tempDir = path.parse(dir).dir
  const status = await dirExists(tempDir)
  if (status) {
    const result = mkdir(dir)
    console.log('🚀 ~ file: Utils.js ~ line 57 ~ dirExist ~ result', result)
    return result
  } else {
    return false
  }
}

const rename = (obj, key, newkey) => {
  if (Object.keys(obj).indexOf(key) !== -1) {
    obj[newkey] = obj[key]
    delete obj[key]
  }
  return obj
}

const sortObj = (arr, property) => {
  return arr.sort((m, n) => m[property] - n[property])
}

const sortMenus = (tree) => {
  tree = sortObj(tree, 'sort')
  if (tree.children && tree.children.length > 0) {
    tree.children = sortMenus(tree.children, 'sort')
  }
  if (tree.operations && tree.operations.length > 0) {
    tree.operations = sortMenus(tree.operations, 'sort')
  }
  return tree
}

const getMenuData = (tree, rights, flag) => {
  const arr = []
  const newRights = []
  if (!rights || !Array.isArray(rights)) {
    return sortObj(arr, 'sort')
  }
  rights.forEach((item) => {
    const id = Array.isArray(item) ? item[0] : item
    if (id !== undefined && id !== null && id !== '') {
      newRights.push(String(id))
    }
  })
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i]
    // _id 包含在menus中
    // 结构进行改造，删除opertaions
    if (newRights.includes(item._id + '')) {
      if (item.type === 'menu') {
        arr.push({
          _id: item._id,
          name: item.name,
          path: item.path,
          sort: item.sort,
          redirect: item.redirect,
          meta: {
            title: item.title,
            hideInBread: item.hideInBread,
            hideInMenu: item.hideInMenu,
            notCache: item.notCache,
            icon: item.icon
          },
          component: item.component,
          children: getMenuData(item.children, rights)
        })
      } else if (item.type === 'link') {
        arr.push({
          _id: item._id,
          name: item.name,
          path: item.path,
          sort: item.sort,
          meta: {
            title: item.title,
            icon: item.icon,
            href: item.link
          }
        })
      }
    }
  }

  return sortObj(arr, 'sort')
}

export { CheckCode, getJWTPayload, dirExists, rename, sortMenus, getMenuData }
