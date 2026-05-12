export const DEFAULT_AVATAR_URL = '/img/default-avatar.svg'

export function resolveAvatarUrl(pic) {
  if (pic && String(pic).trim()) {
    return String(pic).trim()
  }
  return DEFAULT_AVATAR_URL
}

/** 远程头像加载失败时回退到本地默认图，避免裂图 */
export function onAvatarImgError(e) {
  const el = e.target
  if (!el || el.getAttribute('data-avatar-fallback') === '1') return
  el.setAttribute('data-avatar-fallback', '1')
  el.onerror = null
  el.src = DEFAULT_AVATAR_URL
}
