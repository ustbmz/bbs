import { setValue, getValue, getHValue, delValue } from '../config/RedisConfig'

setValue('setJS', 'this data is from api project')

getValue('setJS').then((res) => {
  console.log(res)
})

delValue('setJS')

setValue('setHvalue', { name: 'imooc', age: 20, email: 'imooc@imooc.com' })

getHValue('setHvalue').then((res) => {
  console.log(JSON.stringify(res))
})
