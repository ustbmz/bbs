/**
 * Seed dev data (English):
 * - Posts: all list tabs (All / Open / Closed / Featured — see front List.vue tag "Featured")
 * - Links & tips (sidebar)
 * - Sample comments on the first SEED post
 *
 * Run: npm run seed
 * Or: npx babel-node scripts/seed-list-posts.js
 */
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import '../src/config/DBHelper'
import Post from '../src/model/Post'
import User from '../src/model/User'
import Link from '../src/model/Link'
import Comments from '../src/model/Comments'

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

async function ensureUser () {
  let user = await User.findOne()
  if (user) return user

  const hash = await bcrypt.hash('SeedPass123', 5)
  user = new User({
    username: 'seed.user@example.com',
    name: 'Seed User',
    password: hash
  })
  await user.save()
  console.log('Created seed user: seed.user@example.com / SeedPass123')
  return user
}

async function seedLinks () {
  await Link.deleteMany({ title: { $regex: /^SEED:/ } })
  const rows = [
    {
      title: 'SEED: Vue.js',
      link: 'https://vuejs.org',
      type: 'link',
      isTop: '0',
      sort: '1'
    },
    {
      title: 'SEED: MongoDB Docs',
      link: 'https://www.mongodb.com/docs/',
      type: 'link',
      isTop: '0',
      sort: '2'
    },
    {
      title: 'SEED: Start Redis before testing captcha or login flows.',
      link: '',
      type: 'tip',
      isTop: '0',
      sort: '1'
    },
    {
      title: 'SEED: API listens on port 3000 by default.',
      link: '',
      type: 'tip',
      isTop: '0',
      sort: '2'
    }
  ]
  for (const row of rows) {
    await new Link(row).save()
  }
  console.log(`Inserted ${rows.length} SEED links/tips`)
}

async function main () {
  await waitConnected()

  const user = await ensureUser()
  const uid = user._id.toString()

  const oldSeedPosts = await Post.find({ title: { $regex: /^SEED:/ } }).select('_id')
  const oldIds = oldSeedPosts.map((p) => p._id.toString())
  if (oldIds.length) {
    await Comments.deleteMany({ tid: { $in: oldIds } })
  }
  await Post.deleteMany({ title: { $regex: /^SEED:/ } })

  const posts = [
    {
      uid,
      title: 'SEED: Open — How do I run the API locally?',
      content:
        'English seed post for the **open** filter (status 0). Covers Node, MongoDB, and Redis.',
      catalog: 'ask',
      fav: 10,
      isEnd: '0',
      reads: 12,
      answer: 0,
      status: '0',
      isTop: '0',
      sort: '0',
      tags: []
    },
    {
      uid,
      title: 'SEED: Closed — Deployment checklist summary',
      content:
        'English seed post for the **closed** filter (status 1). This thread is marked as resolved.',
      catalog: 'share',
      fav: 20,
      isEnd: '1',
      reads: 40,
      answer: 0,
      status: '1',
      isTop: '0',
      sort: '0',
      tags: []
    },
    {
      uid,
      title: 'SEED: Featured (open) — REST API design tips',
      content:
        'English **featured** post, still open. Appears under Featured, All, and Open tabs.',
      catalog: 'discuss',
      fav: 30,
      isEnd: '0',
      reads: 100,
      answer: 0,
      status: '0',
      isTop: '0',
      sort: '1',
      tags: [{ name: 'Featured', class: 'layui-bg-red' }]
    },
    {
      uid,
      title: 'SEED: Featured (closed) — Archived migration notes',
      content:
        'English **featured** post, closed. Appears under Featured, All, and Closed tabs.',
      catalog: 'notice',
      fav: 15,
      isEnd: '1',
      reads: 200,
      answer: 0,
      status: '1',
      isTop: '0',
      sort: '1',
      tags: [
        { name: 'Featured', class: 'layui-bg-red' },
        { name: 'Hot', class: 'layui-bg-blue' }
      ]
    }
  ]

  const saved = []
  for (const p of posts) {
    const doc = new Post(p)
    saved.push(await doc.save())
  }

  const openPost = saved.find((p) =>
    p.title.startsWith('SEED: Open')
  )
  if (openPost) {
    const tid = openPost._id.toString()
    const replyBodies = [
      'SEED REPLY: Run `cd api && npm start` and keep MongoDB plus Redis running.',
      'SEED REPLY: Check `src/config/index.js` for DB_URL and Redis password.',
      'SEED REPLY: Front dev server is usually `npm run dev` on port 8082.'
    ]
    for (const content of replyBodies) {
      await new Comments({
        tid,
        uid,
        cuid: uid,
        content,
        status: '1'
      }).save()
    }
    await Post.updateOne(
      { _id: openPost._id },
      { $set: { answer: replyBodies.length } }
    )
  }

  await seedLinks()

  console.log(`Inserted ${saved.length} SEED posts for uid=${uid}`)
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
