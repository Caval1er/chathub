class Cache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, expirationTimeInSeconds = 30) {
    const expirationTimestamp = Date.now() + expirationTimeInSeconds * 1000;
    this.cache.set(key, { value, expirationTimestamp });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry || entry.expirationTimestamp < Date.now()) {
      // 值不存在或已过期
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  clear() {
    this.cache.clear();
  }

  remove(key) {
    this.cache.delete(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  cleanupExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expirationTimestamp < now) {
        this.cache.delete(key);
      }
    }
  }
}
module.exports = Cache;
