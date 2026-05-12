import Vue from 'vue'
import VueI18n from 'vue-i18n'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import messages from './locales/messages'

Vue.use(VueI18n)

const saved =
  typeof localStorage !== 'undefined' ? localStorage.getItem('app_locale') : null
const locale = saved === 'en' || saved === 'zh' ? saved : 'en'

const i18n = new VueI18n({
  locale,
  fallbackLocale: 'en',
  silentTranslationWarn: true,
  messages
})

export function syncDocumentLang (loc) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('lang', loc === 'zh' ? 'zh-CN' : 'en')
}

syncDocumentLang(locale)
dayjs.locale(locale === 'zh' ? 'zh-cn' : 'en')

export default i18n
