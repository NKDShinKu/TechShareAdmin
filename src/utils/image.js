/**
 * 图片相关工具函数
 */

const API_BASE_URL = 'http://localhost:3000'
const DEFAULT_AVATAR = '/default_avatar.png'

/**
 * 获取完整的图片 URL
 * @param {string} path 图片相对路径，如 /uploads/avatars/xxx.png
 * @returns {string} 完整的图片 URL
 */
export function getImageUrl(path) {
  if (!path) {
    return DEFAULT_AVATAR
  }
  
  // 如果已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // 如果是相对路径，拼接 API 地址
  return `${API_BASE_URL}${path}`
}

/**
 * 获取头像 URL（如果为空则使用默认头像）
 * @param {string} avatarUrl 头像相对路径
 * @returns {string} 完整的头像 URL
 */
export function getAvatarUrl(avatarUrl) {
  if (!avatarUrl) {
    return DEFAULT_AVATAR
  }
  return getImageUrl(avatarUrl)
}

/**
 * 获取封面图 URL
 * @param {string} coverUrl 封面图相对路径
 * @returns {string|undefined} 完整的封面图 URL，如果为空则返回 undefined
 */
export function getCoverUrl(coverUrl) {
  if (!coverUrl) {
    return undefined
  }
  return getImageUrl(coverUrl)
}
