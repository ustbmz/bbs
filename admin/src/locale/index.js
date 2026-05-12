import { localRead } from '@/libs/util'
import enUsLocale from 'view-design/src/locale/lang/en-US'
import zhCnLocale from 'view-design/src/locale/lang/zh-CN'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import customEnUs from './lang/en-US'
import customZhCn from './lang/zh-CN'
import extraEn from './lang/extra-en'
import extraZh from './lang/extra-zh'

Vue.use(VueI18n)

// 默认英文；仅在用户通过语言切换写入 local 后沿用其选择
const lang = localRead('local') || 'en-US'

Vue.config.lang = lang

// vue-i18n 6.x+写法
// eslint-disable-next-line prettier/prettier
Vue.locale = () => { }
const messages = {
  'zh-CN': Object.assign({}, zhCnLocale, customZhCn, extraZh),
  'en-US': Object.assign({}, enUsLocale, customEnUs, extraEn)
}
const i18n = new VueI18n({
  locale: lang,
  messages,
  silentTranslationWarn: true
})

export default i18n

// vue-i18n 5.x写法
// Vue.locale('zh-CN', Object.assign(zhCnLocale, customZhCn))
// Vue.locale('en-US', Object.assign(zhTwLocale, customZhTw))
// Vue.locale('zh-TW', Object.assign(enUsLocale, customEnUs))
