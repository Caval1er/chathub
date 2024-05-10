import { decrypt as aesDecrypt, encrypt as aesEncrypt } from 'crypto-js/aes'
import UTF8, { parse } from 'crypto-js/enc-utf8'
import pkcs7 from 'crypto-js/pad-pkcs7'
import CTR from 'crypto-js/mode-ctr'

class AesCrypto {
  constructor(key, iv) {
    this.key = parse(key)
    this.iv = parse(iv)
  }

  get getOptions() {
    return {
      mode: CTR,
      padding: pkcs7,
      iv: this.iv,
    }
  }

  encrypt(plainText) {
    return aesEncrypt(plainText, this.key, this.getOptions).toString()
  }
  decrypt(cipherText) {
    return aesDecrypt(cipherText, this.key, this.getOptions).toString(UTF8)
  }
}

export default AesCrypto
