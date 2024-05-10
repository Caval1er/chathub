import { DEFAULT_CACHE_TIME } from '@/settings/encryptionSetting'
class Persistent {
  constructor(options) {
    this.expiry = (options.expiry || DEFAULT_CACHE_TIME) * 1000
    this.serializer = options.serializer || null
  }
  setItemWithExpiry(key, value) {
    const now = new Date()
    // `expiry` 参数是以秒为单位的持续时间
    const item = {
      value: value,
      expiry: now.getTime() + this.expiry,
    }
    if (this.serializer) {
      localStorage.setItem(key, this.serializer.write(item))
    } else {
      localStorage.setItem(key, JSON.stringify(item))
    }
  }
  getItemWithExpiry(key) {
    const itemStr = localStorage.getItem(key)
    let item
    // 如果不存在，返回null
    if (!itemStr) {
      return null
    }
    if (this.serializer) {
      item = this.serializer.read(itemStr)
    } else {
      item = JSON.parse(itemStr)
    }

    const now = new Date()
    // 检查是否过期
    if (now.getTime() > item.expiry) {
      // 如果数据过期，清除存储并返回null
      localStorage.removeItem(key)
      return null
    }
    return item.value
  }

  removeItem(key) {
    localStorage.removeItem(key)
  }

  // 清空所有 localStorage 数据
  clearLocalStorage() {
    localStorage.clear()
  }
}

export default Persistent
