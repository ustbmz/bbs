/**
 * 初始化管理后台菜单树（menus）与角色（roles），并把 admin 用户设为 super_admin。
 * 与 admin 前端 src/router/community.js 中的 name / path / component 对齐。
 *
 * 运行：npm run seed:admin
 * 依赖：MongoDB 已启动，且与 src/config/index.js 中 DB_URL 一致。
 */
import mongoose from 'mongoose'
import '../src/config/DBHelper'
import Menu from '../src/model/Menus'
import Roles from '../src/model/Roles'
import User from '../src/model/User'

function waitConnected () {
  return new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1) return resolve()
    const onErr = (e) => reject(e)
    mongoose.connection.once('connected', () => {
      mongoose.connection.off('error', onErr)
      resolve()
    })
    mongoose.connection.once('error', onErr)
    setTimeout(
      () => reject(new Error('MongoDB connection timeout (15s)')),
      15000
    )
  })
}

/** 收集根节点及所有子孙菜单 _id（用于写入 roles.menu） */
function collectMenuIdsFromRoot (rootDoc) {
  const ids = [String(rootDoc._id)]
  function walkChildren (nodes) {
    if (!nodes || !nodes.length) return
    for (const n of nodes) {
      ids.push(String(n._id))
      if (n.children && n.children.length) walkChildren(n.children)
    }
  }
  walkChildren(rootDoc.children)
  return ids
}

const MENU_ROOTS = [
  {
    title: '内容管理',
    name: 'content_management',
    path: '/content',
    redirect: '/content/index',
    component: '/components/main',
    icon: 'md-albums',
    sort: '1',
    type: 'menu',
    notCache: true,
    hideInBread: false,
    hideInMenu: false,
    children: [
      {
        title: '文章管理',
        name: 'article_management',
        path: 'index',
        component: '/view/content/index',
        icon: 'ios-paper',
        sort: '1',
        type: 'menu',
        notCache: true
      },
      {
        title: '标签管理',
        name: 'tags_management',
        path: 'tags',
        component: '/view/content/tags',
        icon: 'md-pricetags',
        sort: '2',
        type: 'menu',
        notCache: true
      },
      {
        title: '友链管理',
        name: 'links_management',
        path: 'links',
        component: '/view/content/links',
        icon: 'md-pricetags',
        sort: '3',
        type: 'menu',
        notCache: true
      }
    ]
  },
  {
    title: '内容安全',
    name: 'comments_management',
    path: '/comments',
    redirect: '/comments/index',
    component: '/components/main',
    icon: 'ios-umbrella',
    sort: '2',
    type: 'menu',
    notCache: true,
    children: [
      {
        title: '评论管理',
        name: 'comments_list',
        path: 'index',
        component: '/view/comments/index',
        icon: 'ios-chatbubbles',
        sort: '1',
        type: 'menu',
        notCache: true
      }
    ]
  },
  {
    title: '用户管理',
    name: 'user',
    path: '/user',
    redirect: '/user/index',
    component: '/components/main',
    icon: 'md-albums',
    sort: '3',
    type: 'menu',
    notCache: true,
    children: [
      {
        title: '用户管理',
        name: 'user_management',
        path: 'index',
        component: '/view/user/index',
        icon: 'ios-people',
        sort: '1',
        type: 'menu',
        notCache: true
      }
    ]
  },
  {
    title: '菜单管理',
    name: 'menu',
    path: '/menu',
    redirect: '/menu/index',
    component: '/components/main',
    icon: 'md-settings',
    sort: '4',
    type: 'menu',
    notCache: true,
    children: [
      {
        title: '菜单管理',
        name: 'menu_management',
        path: 'index',
        component: '/view/menu/index',
        icon: 'ios-menu',
        sort: '1',
        type: 'menu',
        notCache: true
      }
    ]
  },
  {
    title: '权限管理',
    name: 'roles',
    path: '/roles',
    redirect: '/roles/index',
    component: '/components/main',
    icon: 'md-checkbox',
    sort: '5',
    type: 'menu',
    notCache: true,
    children: [
      {
        title: '角色权限',
        name: 'roles_management',
        path: 'index',
        component: '/view/roles/index',
        icon: 'md-key',
        sort: '1',
        type: 'menu',
        notCache: true
      }
    ]
  },
  {
    title: '系统管理',
    name: 'system',
    path: '/system',
    redirect: '/system/index',
    component: '/components/main',
    icon: 'md-settings',
    sort: '6',
    type: 'menu',
    notCache: true,
    children: [
      {
        title: '错误日志',
        name: 'logs_check',
        path: 'index',
        component: '/view/logs/index',
        icon: 'ios-bug',
        sort: '1',
        type: 'menu',
        notCache: true
      }
    ]
  },
  {
    title: '博客管理',
    name: 'blog_management',
    path: '/blog',
    redirect: '/blog/index',
    component: '/components/main',
    icon: 'md-albums',
    sort: '7',
    type: 'menu',
    notCache: true,
    children: [
      {
        title: '博客文章管理',
        name: 'mdfile_management',
        path: 'index',
        component: '/view/blog/index',
        icon: 'ios-paper',
        sort: '1',
        type: 'menu',
        notCache: false
      },
      {
        title: '新增文章',
        name: 'add_mdfile',
        path: 'add',
        component: '/view/blog/add',
        icon: 'md-pricetags',
        sort: '2',
        type: 'menu',
        notCache: true
      }
    ]
  }
]

async function run () {
  await waitConnected()

  const menuCount = await Menu.countDocuments()
  const roleCount = await Roles.countDocuments()
  console.log(`当前 menus: ${menuCount}, roles: ${roleCount}`)

  await Menu.deleteMany({})
  await Roles.deleteMany({})

  const savedRoots = []
  for (const data of MENU_ROOTS) {
    const doc = new Menu(data)
    await doc.save()
    savedRoots.push(doc)
  }

  let allIds = []
  for (const root of savedRoots) {
    allIds.push(...collectMenuIdsFromRoot(root))
  }
  allIds = Array.from(new Set(allIds))

  await Roles.create({
    name: '超级管理员',
    role: 'super_admin',
    desc: '全部后台菜单',
    menu: allIds
  })

  await Roles.create({
    name: '管理员',
    role: 'admin',
    desc: '与超级管理员相同（本地开发）',
    menu: allIds
  })

  const adminResult = await User.updateOne(
    { username: 'admin' },
    { $set: { roles: ['super_admin'] } }
  )
  if (adminResult.matchedCount === 0) {
    console.warn(
      '未找到 username 为 admin 的用户：已写入菜单与角色，请自行注册用户后在 MongoDB 中设置 roles: ["super_admin"]，或改用已有用户名执行 updateOne。'
    )
  } else {
    console.log('已更新用户 admin 的角色为 super_admin')
  }

  console.log(`完成：写入 ${savedRoots.length} 个一级菜单，角色 super_admin / admin 各含 ${allIds.length} 个菜单节点 id`)
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
