import Persistent from '@/utlis/cache/persistent'
import AesCrypto from '@/utlis/crypto'
import { TOKEN_KEY } from '@/constant/cacheConstant'
import {
  cacheCipher,
  SHOULD_ENABLE_STORAGE_ENCRYPTION,
} from '@/settings/encryptionSetting'
const persist = new Persistent({
  serializer: customSerializer(SHOULD_ENABLE_STORAGE_ENCRYPTION),
})
export function getToken() {
  return getAuthCache(TOKEN_KEY)
}
function customSerializer(SHOULD_ENABLE_STORAGE_ENCRYPTION) {
  const aesCrypto = new AesCrypto(cacheCipher.key, cacheCipher.iv)

  if (SHOULD_ENABLE_STORAGE_ENCRYPTION) {
    return {
      read: (value) => {
        const decrypted = aesCrypto.decrypt(value)
        return JSON.parse(decrypted)
      },
      write: (value) => {
        const serialized = JSON.stringify(value)
        return aesCrypto.encrypt(serialized)
      },
    }
  } else {
    return {
      read: (value) => {
        return JSON.parse(value)
      },
      write: (value) => {
        return JSON.stringify(value)
      },
    }
  }
}

export function getAuthCache(key) {
  return persist.getItemWithExpiry(key)
}

export function setAuthCache(key, value) {
  persist.setItemWithExpiry(key, value)
}
