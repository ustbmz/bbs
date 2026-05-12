import path from 'path'
const DB_URL = 'mongodb://devadmin:admin123@127.0.0.1:27017/dev'

const Redis = {
  host: '127.0.0.1',
  port: 6379,
  password: 'admin123'
}
const JWT_SECRET =
  '&Vi%33pG2mD51xMo%OUOTo$ZWOa3TYt328tcjXtW9&hn%AOb9quwaZaRMf#f&44c'

const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'http://0.0.0.0:3000'
    : 'http://0.0.0.0:3000'

const uploadPath =
  process.env.NODE_ENV === 'production'
    ? '/usr/share/nginx/api/public'
    : path.join(path.resolve(__dirname), '../../public')

export default {
  DB_URL,
  Redis,
  JWT_SECRET,
  uploadPath,
  baseUrl
}
