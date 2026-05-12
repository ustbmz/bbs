import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import relativeTime from 'dayjs/plugin/relativeTime'
import escapeHtml from '@/utils/escapeHtml'
import i18n from '@/i18n'

dayjs.extend(relativeTime)

const moment = (date) => {
  return dayjs(date).fromNow()
}

const catalogKeys = {
  ask: 'catalog.ask',
  share: 'catalog.share',
  discuss: 'catalog.discuss',
  advise: 'catalog.advise',
  notice: 'catalog.notice',
  logs: 'catalog.logs'
}

const trasnCatalog = (val) => {
  if (!val) return ''
  const path = catalogKeys[val]
  return path ? i18n.t(path) : i18n.t('catalog.unknown')
}

const escapehtml = (content) => {
  if (content === '') {
    return ''
  } else {
    return escapeHtml(content)
  }
}

export default {
  moment, trasnCatalog, escapehtml
}